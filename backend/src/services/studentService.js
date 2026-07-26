import { ApiError } from '../utils/apiError.js';
import { getCurrentDate, getCurrentWeekday } from '../utils/date.js';
import { findUserById } from '../models/userModel.js';
import { listStudentEnrollmentRows } from '../models/enrollmentModel.js';
import { ensureAbsentRowsForDate, getAttendanceCounts, listAttendanceHistory } from '../models/attendanceModel.js';
import { getClassDaysLabel, getSessionDefinition, normalizeClassDays } from '../utils/courseSchedule.js';

const buildEnrollmentSummary = (rows = []) => {
  const grouped = new Map();

  for (const row of rows) {
    if (!grouped.has(row.enrollment_id)) {
      const initialClassDays = normalizeClassDays(row.class_days);
      const initialSession = String(row.session || 'morning').toLowerCase();
      const sessionDefinition = getSessionDefinition(initialSession);

      grouped.set(row.enrollment_id, {
        enrollmentId: row.enrollment_id,
        courseId: row.course_id,
        courseName: row.course_name,
        status: row.enrollment_status,
        session: initialSession,
        sessionLabel: sessionDefinition.label,
        sessionTimeLabel: sessionDefinition.displayTime,
        classDays: initialClassDays,
        classDaysLabel: getClassDaysLabel(initialClassDays),
        startDate: row.start_date || row.program_start_date || null,
        endDate: row.end_date || row.program_end_date || null,
        programStartDate: row.start_date || row.program_start_date || null,
        programEndDate: row.end_date || row.program_end_date || null,
        createdAt: row.enrollment_created_at,
        schedules: []
      });
    }

    if (!row.day_of_week) {
      continue;
    }

    const enrollment = grouped.get(row.enrollment_id);
    const rowClassDays = normalizeClassDays(row.class_days);
    if (rowClassDays.length) {
      continue;
    }

    const nextClassDays = Array.from(new Set([...(enrollment.classDays || []), row.day_of_week]));
    enrollment.classDays = nextClassDays;
    enrollment.classDaysLabel = getClassDaysLabel(nextClassDays);
    enrollment.schedules = [{
      id: row.schedule_id || row.enrollment_id,
      dayOfWeek: enrollment.classDaysLabel,
      startTime: getSessionDefinition(enrollment.session).startTime,
      endTime: getSessionDefinition(enrollment.session).endTime
    }];
  }

  return Array.from(grouped.values()).map((studentEnrollment) => ({
    ...studentEnrollment,
    schedules: studentEnrollment.schedules.length
      ? studentEnrollment.schedules
      : [{
          id: studentEnrollment.enrollmentId,
          dayOfWeek: studentEnrollment.classDaysLabel,
          startTime: getSessionDefinition(studentEnrollment.session).startTime,
          endTime: getSessionDefinition(studentEnrollment.session).endTime
        }]
  }));
};

export const getStudentDashboardOverview = async (studentId) => {
  const student = await findUserById(studentId);
  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  const rows = await listStudentEnrollmentRows();
  const studentRows = rows.filter((row) => row.student_id === studentId && row.enrollment_id);
  const enrollments = buildEnrollmentSummary(studentRows);
  const activeEnrollments = enrollments.filter((item) => item.status === 'active');
  const allCourseNames = Array.from(new Set(enrollments.map((item) => item.courseName)));
  const activeCourseNames = Array.from(new Set(activeEnrollments.map((item) => item.courseName)));
  const startDates = enrollments.map((item) => item.programStartDate).filter(Boolean).sort();
  const endDates = enrollments.map((item) => item.programEndDate).filter(Boolean).sort();

  return {
    student: {
      id: student.id,
      fullName: student.full_name,
      email: student.email,
      phone: student.phone,
      role: student.role,
      isActive: Boolean(student.is_active)
    },
    enrollments,
    activeEnrollments,
    courseSummary: allCourseNames.join(', '),
    activeCourseNames,
    programStartDate: startDates[0] || null,
    programEndDate: endDates[endDates.length - 1] || null,
    status: activeEnrollments.length ? 'active' : enrollments.length ? 'inactive' : 'unassigned'
  };
};

export const getStudentEnrollments = async (studentId) => {
  const overview = await getStudentDashboardOverview(studentId);
  return overview.enrollments;
};

export const getStudentSchedules = async (studentId) => {
  const enrollments = await getStudentEnrollments(studentId);
  return enrollments.map((enrollment) => ({
    enrollmentId: enrollment.enrollmentId,
    courseId: enrollment.courseId,
    courseName: enrollment.courseName,
    status: enrollment.status,
    session: enrollment.session,
    sessionLabel: enrollment.sessionLabel,
    sessionTimeLabel: enrollment.sessionTimeLabel,
    classDays: enrollment.classDays,
    classDaysLabel: enrollment.classDaysLabel,
    programStartDate: enrollment.programStartDate,
    programEndDate: enrollment.programEndDate,
    schedules: enrollment.schedules
  }));
};

const buildAttendanceRange = (rows = []) => {
  const dates = rows
    .flatMap((row) => [row.start_date || row.program_start_date, row.end_date || row.program_end_date])
    .filter(Boolean)
    .sort((left, right) => new Date(left).getTime() - new Date(right).getTime());

  const fromDate = dates[0] || getCurrentDate();
  return {
    fromDate,
    toDate: getCurrentDate()
  };
};

const backfillAbsentRowsIfNeeded = async (range) => {
  const today = getCurrentDate();
  if (range.fromDate <= today && range.toDate >= today) {
    await ensureAbsentRowsForDate(today, getCurrentWeekday());
  }
};

export const getStudentAttendanceSummary = async (studentId) => {
  const rows = await listStudentEnrollmentRows();
  const studentRows = rows.filter((row) => row.student_id === studentId && row.enrollment_id);
  const range = buildAttendanceRange(studentRows);
  await backfillAbsentRowsIfNeeded(range);
  const summary = await getAttendanceCounts({
    ...range,
    studentId
  });

  const totalAttendance = Number(summary.totalAttendance || 0);
  const presentCount = Number(summary.presentCount || 0);
  const lateCount = Number(summary.lateCount || 0);
  const absentCount = Number(summary.absentCount || 0);

  return {
    ...summary,
    presentCount,
    lateCount,
    absentCount,
    totalAttendance,
    attendancePercentage: totalAttendance === 0
      ? 0
      : Number(((presentCount / totalAttendance) * 100).toFixed(2)),
    range
  };
};

export const getStudentAttendanceHistory = async (studentId, filters = {}) => {
  const rows = await listStudentEnrollmentRows();
  const studentRows = rows.filter((row) => row.student_id === studentId && row.enrollment_id);
  const range = filters.from && filters.to
    ? { fromDate: filters.from, toDate: filters.to }
    : buildAttendanceRange(studentRows);
  await backfillAbsentRowsIfNeeded(range);

  const summary = await getAttendanceCounts({
    ...range,
    studentId,
    courseId: filters.courseId || null,
    status: filters.status || null,
    search: filters.search || null
  });
  const totalAttendance = Number(summary.totalAttendance || 0);
  const presentCount = Number(summary.presentCount || 0);
  const lateCount = Number(summary.lateCount || 0);
  const absentCount = Number(summary.absentCount || 0);

  const records = await listAttendanceHistory({
    ...range,
    studentId,
    courseId: filters.courseId || null,
    status: filters.status || null,
    search: filters.search || null
  });

  return {
    student: await findUserById(studentId),
    range,
    filters: {
      courseId: filters.courseId || null,
      from: filters.from || null,
      to: filters.to || null,
      status: filters.status || null
    },
    summary: {
      ...summary,
      presentCount,
      lateCount,
      absentCount,
      totalAttendance,
      attendancePercentage: totalAttendance === 0
        ? 0
        : Number(((presentCount / totalAttendance) * 100).toFixed(2))
    },
    records
  };
};
