import { ApiError } from '../utils/apiError.js';
import { createId } from '../utils/uuid.js';
import { query } from '../config/db.js';
import { findCourseById } from '../models/courseModel.js';
import { findUserById } from '../models/userModel.js';
import {
  createEnrollment,
  findEnrollmentById,
  findActiveEnrollmentsByStudent,
  listEnrolledStudents,
  listEnrollments,
  listUnenrolledStudents
} from '../models/enrollmentModel.js';

export const enrollStudent = async ({
  studentId,
  courseId,
  programStartDate,
  programEndDate,
  enrollmentStatus = 'active'
}) => {
  const student = await findUserById(studentId);
  if (!student || student.role !== 'student') {
    throw new ApiError(400, 'Student not found.');
  }

  const course = await findCourseById(courseId);
  if (!course) {
    throw new ApiError(400, 'Course not found.');
  }

  const activeEnrollments = await findActiveEnrollmentsByStudent(studentId);
  if (activeEnrollments.length > 0) {
    throw new ApiError(409, 'Student already has an active enrollment.');
  }

  return createEnrollment({
    id: createId(),
    studentId,
    courseId,
    programStartDate,
    programEndDate,
    enrollmentStatus
  });
};

export const updateEnrollment = async (enrollmentId, updates) => {
  const existing = await findEnrollmentById(enrollmentId);
  if (!existing) {
    throw new ApiError(404, 'Enrollment not found.');
  }

  const nextStudentId = updates.studentId ?? existing.student_id;
  const nextCourseId = updates.courseId ?? existing.course_id;

  if (updates.studentId) {
    const student = await findUserById(nextStudentId);
    if (!student || student.role !== 'student') {
      throw new ApiError(400, 'Student not found.');
    }
  }

  if (updates.courseId) {
    const course = await findCourseById(nextCourseId);
    if (!course) {
      throw new ApiError(400, 'Course not found.');
    }
  }

  await query(
    `UPDATE enrollments
     SET student_id = ?, course_id = ?, program_start_date = ?, program_end_date = ?, enrollment_status = ?
     WHERE id = ?`,
    [
      nextStudentId,
      nextCourseId,
      updates.programStartDate ?? existing.program_start_date,
      updates.programEndDate ?? existing.program_end_date,
      updates.enrollmentStatus ?? existing.enrollment_status,
      enrollmentId
    ]
  );

  return findEnrollmentById(enrollmentId);
};

export const endProgram = async (enrollmentId) => {
  const existing = await findEnrollmentById(enrollmentId);
  if (!existing) {
    throw new ApiError(404, 'Enrollment not found.');
  }

  await query(
    "UPDATE enrollments SET enrollment_status = 'completed' WHERE id = ?",
    [enrollmentId]
  );

  return findEnrollmentById(enrollmentId);
};

export const getEnrollment = async (enrollmentId) => {
  const enrollment = await findEnrollmentById(enrollmentId);
  if (!enrollment) {
    throw new ApiError(404, 'Enrollment not found.');
  }
  return enrollment;
};

export const getAllEnrollments = async () => listEnrollments();

export const getUnenrolledStudents = async () => listUnenrolledStudents();

export const getEnrolledStudents = async () => listEnrolledStudents();
