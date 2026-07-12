import { query } from '../config/db.js';

export const createEnrollment = async ({
  id,
  studentId,
  courseId,
  programStartDate,
  programEndDate,
  enrollmentStatus = 'active'
}) => {
  await query(
    'INSERT INTO enrollments (id, student_id, course_id, program_start_date, program_end_date, enrollment_status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, studentId, courseId, programStartDate, programEndDate, enrollmentStatus]
  );
  return findEnrollmentById(id);
};

export const findEnrollmentById = async (id) => {
  const [rows] = await query(
    `SELECT e.*, u.full_name AS student_name, u.email AS student_email, c.name AS course_name
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     WHERE e.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

export const listEnrollments = async () => {
  const [rows] = await query(
    `SELECT e.*, u.full_name AS student_name, u.email AS student_email, c.name AS course_name
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     ORDER BY e.created_at DESC`
  );
  return rows;
};

export const listUnenrolledStudents = async () => {
  const [rows] = await query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.phone
     FROM users u
     WHERE u.role = 'student'
       AND NOT EXISTS (
         SELECT 1
         FROM enrollments e
         WHERE e.student_id = u.id
           AND e.enrollment_status = 'active'
       )
     ORDER BY u.full_name ASC`
  );
  return rows;
};

export const listEnrolledStudents = async () => {
  const [rows] = await query(
    `SELECT
       e.id AS enrollment_id,
       u.id AS student_id,
       u.full_name,
       u.email,
       u.phone,
       c.name AS course_name,
       e.enrollment_status,
       e.program_start_date,
       e.program_end_date,
       e.created_at
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     WHERE u.role = 'student'
     ORDER BY e.created_at DESC, e.id DESC`
  );

  const latestByStudent = new Map();

  for (const row of rows) {
    if (!latestByStudent.has(row.student_id)) {
      latestByStudent.set(row.student_id, {
        studentId: row.student_id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        courseName: row.course_name,
        status: row.enrollment_status,
        programStartDate: row.program_start_date,
        programEndDate: row.program_end_date
      });
    }
  }

  return Array.from(latestByStudent.values());
};

export const listEnrollmentsByStudent = async (studentId) => {
  const [rows] = await query(
    `SELECT e.*, u.full_name AS student_name, c.name AS course_name
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = ?
     ORDER BY e.created_at DESC`,
    [studentId]
  );
  return rows;
};

export const listEnrollmentsByStudentAndStatus = async (studentId, statuses = []) => {
  if (!statuses.length) {
    return [];
  }

  const statusPlaceholders = statuses.map(() => '?').join(', ');
  const [rows] = await query(
    `SELECT e.*, u.full_name AS student_name, c.name AS course_name
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = ? AND e.enrollment_status IN (${statusPlaceholders})
     ORDER BY e.created_at DESC`,
    [studentId, ...statuses]
  );
  return rows;
};

export const findActiveEnrollmentsByStudent = async (studentId) => {
  const [rows] = await query(
    `SELECT e.*, u.full_name AS student_name, c.name AS course_name
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = ? AND e.enrollment_status = 'active'
     ORDER BY e.created_at DESC`,
    [studentId]
  );
  return rows;
};
