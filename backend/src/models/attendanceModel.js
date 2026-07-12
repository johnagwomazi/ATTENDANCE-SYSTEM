import { query } from '../config/db.js';

export const findAttendanceByStudentCourseDate = async (studentId, courseId, attendanceDate) => {
  const [rows] = await query(
    'SELECT * FROM attendance WHERE student_id = ? AND course_id = ? AND attendance_date = ? LIMIT 1',
    [studentId, courseId, attendanceDate]
  );
  return rows[0] || null;
};

export const upsertAttendance = async ({
  id,
  studentId,
  courseId,
  attendanceDate,
  checkInTime = null,
  status
}) => {
  await query(
    `INSERT INTO attendance (id, student_id, course_id, attendance_date, check_in_time, status)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       check_in_time = VALUES(check_in_time),
       status = VALUES(status),
       updated_at = CURRENT_TIMESTAMP`,
    [id, studentId, courseId, attendanceDate, checkInTime, status]
  );

  return findAttendanceByStudentCourseDate(studentId, courseId, attendanceDate);
};

export const listAttendanceInRange = async ({ fromDate, toDate, courseId = null, studentId = null }) => {
  const filters = ['attendance_date BETWEEN ? AND ?'];
  const params = [fromDate, toDate];

  if (courseId) {
    filters.push('course_id = ?');
    params.push(courseId);
  }

  if (studentId) {
    filters.push('student_id = ?');
    params.push(studentId);
  }

  const [rows] = await query(
    `SELECT * FROM attendance WHERE ${filters.join(' AND ')}`,
    params
  );
  return rows;
};

export const getAttendanceCounts = async ({ fromDate, toDate, courseId = null, studentId = null }) => {
  const filters = ['attendance_date BETWEEN ? AND ?'];
  const params = [fromDate, toDate];

  if (courseId) {
    filters.push('course_id = ?');
    params.push(courseId);
  }

  if (studentId) {
    filters.push('student_id = ?');
    params.push(studentId);
  }

  const [rows] = await query(
    `SELECT
      COUNT(*) AS totalAttendance,
      COALESCE(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END), 0) AS presentCount,
      COALESCE(SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END), 0) AS lateCount,
      COALESCE(SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END), 0) AS absentCount
     FROM attendance
     WHERE ${filters.join(' AND ')}`,
    params
  );

  return rows[0] || {
    totalAttendance: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0
  };
};

export const createAbsentRowsForDate = async (attendanceDate, weekday) => {
  await query(
    `INSERT INTO attendance (id, student_id, course_id, attendance_date, check_in_time, status)
     SELECT UUID(), grouped.student_id, grouped.course_id, ?, NULL, 'absent'
     FROM (
       SELECT DISTINCT e.student_id, e.course_id
       FROM enrollments e
       INNER JOIN schedules s ON s.course_id = e.course_id
       LEFT JOIN attendance a
         ON a.student_id = e.student_id
        AND a.course_id = e.course_id
        AND a.attendance_date = ?
       WHERE e.enrollment_status = 'active'
         AND s.day_of_week = ?
         AND a.id IS NULL
     ) AS grouped`,
    [attendanceDate, attendanceDate, weekday]
  );
};
