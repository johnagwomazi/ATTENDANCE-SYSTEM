import { ApiError } from '../utils/apiError.js';
import { createId } from '../utils/uuid.js';
import { getCurrentDate, getCurrentTime, getCurrentWeekday, getDateDaysAgo, getMonthStartDate, isTodayWithinGracePeriod, timeToMinutes } from '../utils/date.js';
import { createEntryAttempt } from '../models/entryAttemptModel.js';
import { findAttendanceByStudentCourseDate, getAttendanceCounts, listAttendanceInRange, upsertAttendance } from '../models/attendanceModel.js';
import { validateAttendanceSessionToken } from './attendanceSessionService.js';
import { emitToManagers, getIO } from '../config/socket.js';
import { query } from '../config/db.js';

const getMatchingSchedule = (schedules) => {
  if (!schedules.length) return null;
  return [...schedules].sort((left, right) => timeToMinutes(left.start_time) - timeToMinutes(right.start_time))[0];
};

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
    `SELECT e.*, c.name AS course_name
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

const getSchedulesForCoursesToday = async (courseIds, weekday) => {
  if (!courseIds.length) return [];

  const placeholders = courseIds.map(() => '?').join(', ');
  const [rows] = await query(
    `SELECT s.*, c.name AS course_name
     FROM schedules s
     JOIN courses c ON c.id = s.course_id
     WHERE s.course_id IN (${placeholders}) AND s.day_of_week = ?`,
    [...courseIds, weekday]
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

  const candidateSchedules = await getSchedulesForCoursesToday(
    active.map((item) => item.course_id),
    currentWeekday
  );
  const selectedSchedule = getMatchingSchedule(candidateSchedules);

  if (!selectedSchedule) {
    const fallbackCourseId = active[0]?.course_id || null;
    await createAttempt({
      studentId: student.id,
      courseId: fallbackCourseId,
      attemptType: 'invalid_schedule'
    });

    throw new ApiError(400, 'You do not have a scheduled class today.');
  }

  const existingAttendance = await findAttendanceByStudentCourseDate(
    student.id,
    selectedSchedule.course_id,
    attendanceDate
  );

  const attendanceStatus = isTodayWithinGracePeriod(selectedSchedule.start_time, currentTime, 15) ? 'present' : 'late';

  if (existingAttendance && existingAttendance.status !== 'absent') {
    await createAttempt({
      studentId: student.id,
      courseId: selectedSchedule.course_id,
      attemptType: 'duplicate_attempt'
    });

    throw new ApiError(400, 'Attendance already recorded.');
  }

  const attendanceRecord = await upsertAttendance({
    id: existingAttendance?.id || createId(),
    studentId: student.id,
    courseId: selectedSchedule.course_id,
    attendanceDate,
    checkInTime: currentTime,
    status: attendanceStatus
  });

  const payload = {
    studentName: student.fullName || student.full_name,
    course: selectedSchedule.course_name,
    time: currentTime,
    status: attendanceStatus
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

export const getAttendanceReport = async ({ type, courseId = null, studentId = null, from = null, to = null }) => {
  const range = from && to ? { fromDate: from, toDate: to } : buildRange(type);
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
    : Number((((presentCount + lateCount) / totalAttendance) * 100).toFixed(2));

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
