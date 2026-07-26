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
import { getClassDaysLabel, getSessionDefinition, normalizeClassDays } from '../utils/courseSchedule.js';

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
        classDaysSummary: '',
        status: 'unassigned'
      });
    }

    if (!row.enrollment_id || !row.course_id) {
      continue;
    }

    const student = grouped.get(row.student_id);
    const enrollment = student.enrollments.find((item) => item.enrollmentId === row.enrollment_id);
    const existingClassDays = normalizeClassDays(enrollment?.classDays || row.class_days);
    const legacyDays = row.day_of_week ? [row.day_of_week] : [];
    const classDays = existingClassDays.length ? existingClassDays : legacyDays;
    const session = String(row.session || enrollment?.session || 'morning').toLowerCase();
    const sessionDefinition = getSessionDefinition(session);

    if (enrollment) {
      if (legacyDays.length) {
        enrollment.classDays = Array.from(new Set([...(enrollment.classDays || []), ...legacyDays]));
        enrollment.classDaysLabel = getClassDaysLabel(enrollment.classDays);
        enrollment.schedules = [{
          id: row.enrollment_id,
          dayOfWeek: enrollment.classDaysLabel,
          startTime: sessionDefinition.startTime,
          endTime: sessionDefinition.endTime
        }];
      }
      continue;
    }

    const nextEnrollment = {
      enrollmentId: row.enrollment_id,
      courseId: row.course_id,
      courseName: row.course_name,
      status: row.enrollment_status,
      session,
      sessionLabel: sessionDefinition.label,
      sessionTimeLabel: sessionDefinition.displayTime,
      classDays,
      classDaysLabel: getClassDaysLabel(classDays),
      startDate: row.start_date || row.program_start_date || null,
      endDate: row.end_date || row.program_end_date || null,
      programStartDate: row.start_date || row.program_start_date || null,
      programEndDate: row.end_date || row.program_end_date || null,
      createdAt: row.enrollment_created_at,
      schedules: classDays.length
        ? [{
            id: row.enrollment_id,
            dayOfWeek: getClassDaysLabel(classDays),
            startTime: sessionDefinition.startTime,
            endTime: sessionDefinition.endTime
          }]
        : []
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
    classDaysSummary: student.enrollments.map((item) => item.classDaysLabel).filter(Boolean).join(' | '),
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
  session = 'morning',
  enrollmentStatus = 'active',
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

  const normalizedSession = String(session || 'morning').toLowerCase();
  if (!['morning', 'afternoon'].includes(normalizedSession)) {
    throw new ApiError(400, 'A valid session is required.');
  }

  const enrollment = await createEnrollment({
    id: createId(),
    studentId,
    courseId,
    session: normalizedSession,
    enrollmentStatus
  });

  return {
    enrollment
  };
};

export const updateEnrollment = async (enrollmentId, updates) => {
  const existing = await findEnrollmentById(enrollmentId);
  if (!existing) {
    throw new ApiError(404, 'Enrollment not found.');
  }

  const nextStudentId = updates.studentId ?? existing.student_id;
  const nextCourseId = updates.courseId ?? existing.course_id;
  const nextSession = updates.session ?? existing.session;

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

  if (updates.session && !['morning', 'afternoon'].includes(String(updates.session).toLowerCase())) {
    throw new ApiError(400, 'A valid session is required.');
  }

  const nextEnrollmentStatus = String(updates.enrollmentStatus ?? existing.enrollment_status ?? 'active').toLowerCase();
  if (nextEnrollmentStatus === 'active') {
    const conflictingEnrollment = await findActiveEnrollmentByStudentAndCourse(nextStudentId, nextCourseId);
    if (conflictingEnrollment && conflictingEnrollment.id !== existing.id) {
      throw new ApiError(409, 'Student already has an active enrollment for this course.');
    }
  }

  await query(
    `UPDATE enrollments
     SET student_id = ?, course_id = ?, session = ?, enrollment_status = ?
     WHERE id = ?`,
    [
      nextStudentId,
      nextCourseId,
      String(nextSession || 'morning').toLowerCase(),
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
