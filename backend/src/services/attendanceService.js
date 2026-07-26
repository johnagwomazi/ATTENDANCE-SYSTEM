import { ApiError } from '../utils/apiError.js';
import { createId } from '../utils/uuid.js';
import { getCurrentDate, getCurrentTime, getCurrentWeekday, getDateDaysAgo, getMonthStartDate, isTodayWithinGracePeriod, timeToMinutes } from '../utils/date.js';
import { createEntryAttempt } from '../models/entryAttemptModel.js';
import { ensureAbsentRowsForDate, findAttendanceByStudentCourseDate, getAttendanceCounts, listAttendanceInRange, upsertAttendance } from '../models/attendanceModel.js';
import { validateAttendanceSessionToken } from './attendanceSessionService.js';
import { emitToManagers, getIO } from '../config/socket.js';
import { query } from '../config/db.js';
import { getSessionDefinition, isCourseOpenOnWeekday, normalizeClassDays } from '../utils/courseSchedule.js';

const createAttempt = async ({ studentId = null, courseId = null, attemptType }) => {
  await createEntryAttempt({
    id: createId(),
    studentId,
    courseId,
    attemptTime: new Date(),
    attemptType
  });
};

const getActiveAndBlockedEnrollments = async (studentId) => {
  const [rows] = await query(
    `SELECT e.*, c.name AS course_name, c.class_days, c.start_date, c.end_date
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = ?
     ORDER BY e.created_at DESC`,
    [studentId]
  );

  return {
    active: rows.filter((row) => row.enrollment_status === 'active'),
    blocked: rows.filter((row) => ['completed', 'expired', 'suspended'].includes(row.enrollment_status))
  };
};

const getLegacySchedulesForCourses = async (courseIds) => {
  if (!courseIds.length) return [];

  const placeholders = courseIds.map(() => '?').join(', ');
  const [rows] = await query(
    `SELECT s.*
     FROM schedules s
     WHERE s.course_id IN (${placeholders})
     ORDER BY s.day_of_week, s.start_time`,
    courseIds
  );
  return rows;
};

export const checkInStudent = async ({ student, token }) => {
  if (!student || student.role !== 'student') {
    throw new ApiError(403, 'Forbidden');
  }

  const attendanceDate = getCurrentDate();
  const currentTime = getCurrentTime();
  const currentWeekday = getCurrentWeekday();

  const { active, blocked } = await getActiveAndBlockedEnrollments(student.id);
  if (!active.length) {
    if (blocked.length) {
      const blockedEnrollment = blocked[0];
      await createAttempt({
        studentId: student.id,
        courseId: blockedEnrollment?.course_id || null,
        attemptType: 'expired_program'
      });

      emitToManagers('expired-checkin-attempt', {
        studentName: student.fullName || student.full_name || student.email,
        course: blockedEnrollment?.course_name || '',
        time: currentTime
      });

      throw new ApiError(400, 'This program has ended. Please contact administration if you believe this is an error.');
    }

    await createAttempt({
      studentId: student.id,
      courseId: null,
      attemptType: 'invalid_schedule'
    });

    throw new ApiError(400, 'You do not have a scheduled class today.');
  }

  const session = await validateAttendanceSessionToken(token);
  if (!session) {
    const fallbackCourseId = active[0]?.course_id || null;
    await createAttempt({
      studentId: student.id,
      courseId: fallbackCourseId,
      attemptType: 'expired_qr'
    });
    throw new ApiError(400, 'The QR session has expired. Please scan a fresh code.');
  }

  const legacySchedules = await getLegacySchedulesForCourses(
    active.map((item) => item.course_id)
  );
  const legacySchedulesByCourse = legacySchedules.reduce((acc, schedule) => {
    if (!acc.has(schedule.course_id)) {
      acc.set(schedule.course_id, []);
    }
    acc.get(schedule.course_id).push(schedule);
    return acc;
  }, new Map());

  const candidateEnrollments = active.map((item) => {
    const classDays = normalizeClassDays(item.class_days);
    const nowMinutes = timeToMinutes(currentTime);

    if (classDays.length) {
      if (!isCourseOpenOnWeekday(classDays, currentWeekday)) {
        return null;
      }

      const sessionDefinition = getSessionDefinition(item.session);
      const startMinutes = timeToMinutes(sessionDefinition.startTime);
      const endMinutes = timeToMinutes(sessionDefinition.endTime);

      if (nowMinutes < startMinutes || nowMinutes > endMinutes) {
        return null;
      }

      return {
        enrollment: item,
        window: {
          startTime: sessionDefinition.startTime,
          endTime: sessionDefinition.endTime,
          label: sessionDefinition.label
        }
      };
    }

    const legacySchedule = (legacySchedulesByCourse.get(item.course_id) || []).find((schedule) => schedule.day_of_week === currentWeekday);
    if (!legacySchedule) {
      return null;
    }

    const startMinutes = timeToMinutes(legacySchedule.start_time);
    const endMinutes = timeToMinutes(legacySchedule.end_time);
    if (nowMinutes < startMinutes || nowMinutes > endMinutes) {
      return null;
    }

    return {
      enrollment: item,
      window: {
        startTime: legacySchedule.start_time,
        endTime: legacySchedule.end_time,
        label: legacySchedule.day_of_week
      }
    };
  }).filter(Boolean);

  const selectedMatch = candidateEnrollments[0] || null;
  const selectedEnrollment = selectedMatch?.enrollment || null;

  if (!selectedEnrollment) {
    const fallbackCourseId = active[0]?.course_id || null;
    await createAttempt({
      studentId: student.id,
      courseId: fallbackCourseId,
      attemptType: 'invalid_schedule'
    });

    throw new ApiError(400, 'You do not have a scheduled class today.');
  }

  const selectedWindow = selectedMatch.window;
  const selectedCourseName = selectedEnrollment.course_name;

  const existingAttendance = await findAttendanceByStudentCourseDate(
    student.id,
    selectedEnrollment.course_id,
    attendanceDate
  );

  const isLate = !isTodayWithinGracePeriod(selectedWindow.startTime, currentTime, 15);
  const attendanceStatus = 'present';

  if (existingAttendance && existingAttendance.status !== 'absent') {
    await createAttempt({
      studentId: student.id,
      courseId: selectedEnrollment.course_id,
      attemptType: 'duplicate_attempt'
    });

    throw new ApiError(400, 'Attendance already recorded.');
  }

  const attendanceRecord = await upsertAttendance({
    id: existingAttendance?.id || createId(),
    studentId: student.id,
    courseId: selectedEnrollment.course_id,
    enrollmentId: selectedEnrollment.id || null,
    isLate,
    attendanceDate,
    checkInTime: currentTime,
    status: attendanceStatus
  });

  const payload = {
    studentName: student.fullName || student.full_name,
    course: selectedCourseName,
    time: currentTime,
    status: attendanceStatus,
    isLate,
    session: selectedWindow.label
  };

  getIO()?.emit('attendance-recorded', payload);

  return {
    attendance: attendanceRecord,
    meta: payload,
    message: existingAttendance?.status === 'absent'
      ? 'Attendance updated successfully.'
      : 'Attendance recorded successfully.'
  };
};

const buildRange = (type) => {
  const today = getCurrentDate();
  const now = new Date();

  if (type === 'today') {
    return { fromDate: today, toDate: today };
  }

  if (type === 'weekly') {
    return {
      fromDate: getDateDaysAgo(6, now),
      toDate: today
    };
  }

  return {
    fromDate: getMonthStartDate(now),
    toDate: today
  };
};

const backfillAbsentRowsIfNeeded = async (range) => {
  const today = getCurrentDate();
  if (range.fromDate <= today && range.toDate >= today) {
    await ensureAbsentRowsForDate(today, getCurrentWeekday());
  }
};

export const getAttendanceReport = async ({ type, courseId = null, studentId = null, from = null, to = null }) => {
  const range = from && to ? { fromDate: from, toDate: to } : buildRange(type);
  await backfillAbsentRowsIfNeeded(range);
  const stats = await getAttendanceCounts({
    fromDate: range.fromDate,
    toDate: range.toDate,
    courseId,
    studentId
  });

  const totalAttendance = Number(stats.totalAttendance || 0);
  const presentCount = Number(stats.presentCount || 0);
  const lateCount = Number(stats.lateCount || 0);
  const absentCount = Number(stats.absentCount || 0);
  const attendancePercentage = totalAttendance === 0
    ? 0
    : Number(((presentCount / totalAttendance) * 100).toFixed(2));

  const records = await listAttendanceInRange({
    fromDate: range.fromDate,
    toDate: range.toDate,
    courseId,
    studentId
  });

  return {
    range,
    filters: {
      courseId,
      studentId
    },
    summary: {
      presentCount,
      lateCount,
      absentCount,
      totalAttendance,
      attendancePercentage
    },
    records
  };
};
