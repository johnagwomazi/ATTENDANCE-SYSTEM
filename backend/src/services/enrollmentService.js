import { ApiError } from '../utils/apiError.js';
import { createId } from '../utils/uuid.js';
import { query } from '../config/db.js';
import { findCourseById } from '../models/courseModel.js';
import { findUserById } from '../models/userModel.js';
import {
  createEnrollment,
  findEnrollmentById,
  findActiveEnrollmentByStudentAndCourse,
  listStudentEnrollmentRows,
  listEnrolledStudents,
  listEnrollments,
  listUnenrolledStudents
} from '../models/enrollmentModel.js';
import { syncCourseSchedules } from './scheduleService.js';

const buildStudentEnrollmentSummaries = (rows = []) => {
  const grouped = new Map();

  for (const row of rows) {
    if (!grouped.has(row.student_id)) {
      grouped.set(row.student_id, {
        id: row.student_id,
        studentId: row.student_id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        enrollments: [],
        activeEnrollments: [],
        courseNames: [],
        activeCourseNames: [],
        courseSummary: '',
        status: 'unassigned'
      });
    }

    if (!row.enrollment_id || !row.course_id) {
      continue;
    }

    const student = grouped.get(row.student_id);
    const enrollment = student.enrollments.find((item) => item.enrollmentId === row.enrollment_id);

    const schedule = row.day_of_week
      ? {
          id: row.schedule_id,
          dayOfWeek: row.day_of_week,
          startTime: row.start_time,
          endTime: row.end_time
        }
      : null;

    if (enrollment) {
      if (schedule) {
        enrollment.schedules.push(schedule);
      }
      continue;
    }

    const nextEnrollment = {
      enrollmentId: row.enrollment_id,
      courseId: row.course_id,
      courseName: row.course_name,
      status: row.enrollment_status,
      programStartDate: row.program_start_date,
      programEndDate: row.program_end_date,
      createdAt: row.enrollment_created_at,
      schedules: schedule ? [schedule] : []
    };

    student.enrollments.push(nextEnrollment);
    if (!student.courseNames.includes(row.course_name)) {
      student.courseNames.push(row.course_name);
    }

    if (row.enrollment_status === 'active') {
      student.activeEnrollments.push(nextEnrollment);
      if (!student.activeCourseNames.includes(row.course_name)) {
        student.activeCourseNames.push(row.course_name);
      }
    }
  }

  return Array.from(grouped.values()).map((student) => ({
    ...student,
    activeCourseCount: student.activeEnrollments.length,
    activeCourseNames: student.activeCourseNames,
    courseSummary: student.courseNames.join(', '),
    courseName: student.courseNames.join(', '),
    status: student.activeEnrollments.length ? 'active' : student.enrollments.length ? 'inactive' : 'unassigned',
    latestProgramStartDate: student.enrollments[0]?.programStartDate || null,
    latestProgramEndDate: student.enrollments[0]?.programEndDate || null,
    programStartDate: student.enrollments[0]?.programStartDate || null,
    programEndDate: student.enrollments[0]?.programEndDate || null
  }));
};

export const enrollStudent = async ({
  studentId,
  courseId,
  programStartDate,
  programEndDate,
  enrollmentStatus = 'active',
  courseSchedules = []
}) => {
  const student = await findUserById(studentId);
  if (!student || student.role !== 'student') {
    throw new ApiError(400, 'Student not found.');
  }

  const course = await findCourseById(courseId);
  if (!course) {
    throw new ApiError(400, 'Course not found.');
  }

  const activeEnrollmentForCourse = await findActiveEnrollmentByStudentAndCourse(studentId, courseId);
  if (activeEnrollmentForCourse) {
    throw new ApiError(409, 'Student already has an active enrollment for this course.');
  }

  const enrollment = await createEnrollment({
    id: createId(),
    studentId,
    courseId,
    programStartDate,
    programEndDate,
    enrollmentStatus
  });

  const createdSchedules = await syncCourseSchedules(courseId, courseSchedules);

  return {
    enrollment,
    schedules: createdSchedules
  };
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

export const getAllStudentSummaries = async () => {
  const rows = await listStudentEnrollmentRows();
  return buildStudentEnrollmentSummaries(rows);
};

export const getStudentSummariesForEnrollments = async () => {
  return getAllStudentSummaries();
};
