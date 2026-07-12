import { ApiError } from '../utils/apiError.js';
import { getCurrentDate } from '../utils/date.js';
import { findUserById } from '../models/userModel.js';
import { listStudentEnrollmentRows } from '../models/enrollmentModel.js';
import { getAttendanceCounts, listAttendanceHistory } from '../models/attendanceModel.js';

const buildEnrollmentSummary = (rows = []) => {
  const grouped = new Map();

  for (const row of rows) {
    if (!grouped.has(row.enrollment_id)) {
      grouped.set(row.enrollment_id, {
        enrollmentId: row.enrollment_id,
        courseId: row.course_id,
        courseName: row.course_name,
        status: row.enrollment_status,
        programStartDate: row.program_start_date,
        programEndDate: row.program_end_date,
        createdAt: row.enrollment_created_at,
        schedules: []
      });
    }

    if (!row.day_of_week) {
      continue;
    }

    const enrollment = grouped.get(row.enrollment_id);
    const scheduleKey = `${row.day_of_week}|${row.start_time}|${row.end_time}`;
    const hasSchedule = enrollment.schedules.some(
      (schedule) => `${schedule.dayOfWeek}|${schedule.startTime}|${schedule.endTime}` === scheduleKey
    );

    if (!hasSchedule) {
      enrollment.schedules.push({
        id: row.schedule_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time
      });
    }
  }

  return Array.from(grouped.values());
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
    programStartDate: enrollment.programStartDate,
    programEndDate: enrollment.programEndDate,
    schedules: enrollment.schedules
  }));
};

const buildAttendanceRange = (rows = []) => {
  const dates = rows
    .map((row) => row.program_start_date)
    .filter(Boolean)
    .sort((left, right) => new Date(left).getTime() - new Date(right).getTime());

  const fromDate = dates[0] || getCurrentDate();
  return {
    fromDate,
    toDate: getCurrentDate()
  };
};

export const getStudentAttendanceSummary = async (studentId) => {
  const rows = await listStudentEnrollmentRows();
  const studentRows = rows.filter((row) => row.student_id === studentId && row.enrollment_id);
  const range = buildAttendanceRange(studentRows);
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
      : Number((((presentCount + lateCount) / totalAttendance) * 100).toFixed(2)),
    range
  };
};

export const getStudentAttendanceHistory = async (studentId, filters = {}) => {
  const rows = await listStudentEnrollmentRows();
  const studentRows = rows.filter((row) => row.student_id === studentId && row.enrollment_id);
  const range = filters.from && filters.to
    ? { fromDate: filters.from, toDate: filters.to }
    : buildAttendanceRange(studentRows);

  const summary = await getAttendanceCounts({
    ...range,
    studentId,
    courseId: filters.courseId || null,
    status: filters.status || null
  });
  const totalAttendance = Number(summary.totalAttendance || 0);
  const presentCount = Number(summary.presentCount || 0);
  const lateCount = Number(summary.lateCount || 0);
  const absentCount = Number(summary.absentCount || 0);

  const records = await listAttendanceHistory({
    ...range,
    studentId,
    courseId: filters.courseId || null,
    status: filters.status || null
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
        : Number((((presentCount + lateCount) / totalAttendance) * 100).toFixed(2))
    },
    records
  };
};
