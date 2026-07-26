import { query } from '../config/db.js';

const applyAttendanceStatusFilter = (filters, params, status) => {
  if (!status) return;

  const normalized = String(status).toLowerCase();

  if (normalized === 'late') {
    filters.push("(a.is_late = 1 OR a.status = 'late')");
    return;
  }

  if (normalized === 'present') {
    filters.push('a.status = ?');
    params.push('present');
    return;
  }

  if (normalized === 'absent') {
    filters.push('a.status = ?');
    params.push('absent');
    return;
  }

  filters.push('a.status = ?');
  params.push(status);
};

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
  enrollmentId = null,
  isLate = false,
  attendanceDate,
  checkInTime = null,
  status
}) => {
  await query(
    `INSERT INTO attendance (id, student_id, course_id, enrollment_id, attendance_date, check_in_time, is_late, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       enrollment_id = VALUES(enrollment_id),
       is_late = VALUES(is_late),
       check_in_time = VALUES(check_in_time),
       status = VALUES(status),
       updated_at = CURRENT_TIMESTAMP`,
    [id, studentId, courseId, enrollmentId, attendanceDate, checkInTime, isLate ? 1 : 0, status]
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

export const listAttendanceHistory = async ({ fromDate, toDate, courseId = null, studentId = null, status = null, search = null }) => {
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

  applyAttendanceStatusFilter(filters, params, status);

  if (search) {
    filters.push('(LOWER(c.name) LIKE ? OR LOWER(a.status) LIKE ?)');
    const pattern = `%${String(search).toLowerCase()}%`;
    params.push(pattern, pattern);
  }

  const [rows] = await query(
    `SELECT
      a.*,
      u.full_name AS student_name,
      u.email AS student_email,
      c.name AS course_name
     FROM attendance a
     JOIN users u ON u.id = a.student_id
     JOIN courses c ON c.id = a.course_id
     WHERE ${filters.join(' AND ')}
     ORDER BY a.attendance_date DESC, a.check_in_time DESC, a.created_at DESC`,
    params
  );
  return rows;
};

export const getAttendanceCounts = async ({ fromDate, toDate, courseId = null, studentId = null, status = null, search = null }) => {
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

  applyAttendanceStatusFilter(filters, params, status);

  if (search) {
    filters.push('(LOWER(c.name) LIKE ? OR LOWER(a.status) LIKE ?)');
    const pattern = `%${String(search).toLowerCase()}%`;
    params.push(pattern, pattern);
  }

  const [rows] = await query(
    `SELECT
      COUNT(*) AS totalAttendance,
      COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) AS presentCount,
      COALESCE(SUM(CASE WHEN a.is_late = 1 OR a.status = 'late' THEN 1 ELSE 0 END), 0) AS lateCount,
      COALESCE(SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END), 0) AS absentCount
     FROM attendance a
     JOIN courses c ON c.id = a.course_id
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
    `INSERT INTO attendance (id, student_id, course_id, enrollment_id, attendance_date, check_in_time, is_late, status)
     SELECT UUID(), grouped.student_id, grouped.course_id, grouped.enrollment_id, ?, NULL, 0, 'absent'
     FROM (
       SELECT DISTINCT e.id AS enrollment_id, e.student_id, e.course_id
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
