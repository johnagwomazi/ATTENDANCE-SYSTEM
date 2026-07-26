import { query } from '../config/db.js';
import { getClassDaysLabel, getSessionTimeLabel, normalizeClassDays } from '../utils/courseSchedule.js';

const mapEnrollmentRow = (row) => {
  if (!row) return null;

  const classDays = normalizeClassDays(row.class_days);
  const session = String(row.session || 'morning').toLowerCase();

  return {
    ...row,
    class_days: row.class_days,
    classDays,
    classDaysLabel: getClassDaysLabel(classDays),
    session,
    sessionLabel: session.charAt(0).toUpperCase() + session.slice(1),
    sessionTimeLabel: getSessionTimeLabel(session),
    startDate: row.start_date || row.program_start_date || null,
    endDate: row.end_date || row.program_end_date || null,
    programStartDate: row.start_date || row.program_start_date || null,
    programEndDate: row.end_date || row.program_end_date || null
  };
};

export const createEnrollment = async ({
  id,
  studentId,
  courseId,
  session = 'morning',
  enrollmentStatus = 'active'
}) => {
  await query(
    'INSERT INTO enrollments (id, student_id, course_id, session, enrollment_status) VALUES (?, ?, ?, ?, ?)',
    [id, studentId, courseId, session, enrollmentStatus]
  );
  return findEnrollmentById(id);
};

export const findEnrollmentById = async (id) => {
  const [rows] = await query(
    `SELECT e.*, u.full_name AS student_name, u.email AS student_email, c.name AS course_name, c.class_days, c.start_date, c.end_date
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     WHERE e.id = ?
     LIMIT 1`,
    [id]
  );
  return mapEnrollmentRow(rows[0] || null);
};

export const listEnrollments = async () => {
  const [rows] = await query(
    `SELECT e.*, u.full_name AS student_name, u.email AS student_email, c.name AS course_name, c.class_days, c.start_date, c.end_date
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     ORDER BY e.created_at DESC`
  );
  return rows.map(mapEnrollmentRow);
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
       c.class_days,
       c.start_date,
       c.end_date,
       e.session,
       e.enrollment_status,
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
      const normalized = mapEnrollmentRow(row);
      latestByStudent.set(row.student_id, {
        studentId: row.student_id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        courseName: row.course_name,
        status: row.enrollment_status,
        session: normalized.session,
        sessionLabel: normalized.sessionLabel,
        sessionTimeLabel: normalized.sessionTimeLabel,
        classDays: normalized.classDays,
        classDaysLabel: normalized.classDaysLabel,
        startDate: normalized.startDate,
        endDate: normalized.endDate,
        programStartDate: normalized.programStartDate,
        programEndDate: normalized.programEndDate
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

export const findActiveEnrollmentByStudentAndCourse = async (studentId, courseId) => {
  const [rows] = await query(
    `SELECT e.*, u.full_name AS student_name, c.name AS course_name
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = ? AND e.course_id = ? AND e.enrollment_status = 'active'
     ORDER BY e.created_at DESC
     LIMIT 1`,
    [studentId, courseId]
  );
  return rows[0] || null;
};

export const listStudentEnrollmentRows = async () => {
  const [rows] = await query(
    `SELECT
       u.id AS student_id,
       u.full_name,
       u.email,
       u.phone,
       e.id AS enrollment_id,
       e.course_id,
       e.session,
       e.enrollment_status,
       e.created_at AS enrollment_created_at,
       c.name AS course_name,
       c.class_days,
       c.start_date,
       c.end_date,
       s.id AS schedule_id,
       s.day_of_week,
       s.start_time,
       s.end_time
     FROM users u
     LEFT JOIN enrollments e ON e.student_id = u.id
     LEFT JOIN courses c ON c.id = e.course_id
     LEFT JOIN schedules s ON s.course_id = e.course_id
     WHERE u.role = 'student'
     ORDER BY u.full_name ASC, e.created_at DESC, e.id DESC`
  );
  return rows;
};
