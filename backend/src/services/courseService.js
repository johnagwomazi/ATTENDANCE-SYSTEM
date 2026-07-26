import { ApiError } from '../utils/apiError.js';
import { createId } from '../utils/uuid.js';
import { query } from '../config/db.js';
import { createCourse, deleteCourseById, findCourseById, listCourses } from '../models/courseModel.js';
import { normalizeClassDays } from '../utils/courseSchedule.js';

const normalizeCoursePayload = (payload = {}) => {
  const rawClassDays = payload.classDays || payload.class_days || [payload.classDayOne, payload.classDayTwo];
  const classDays = Array.from(new Set(normalizeClassDays(rawClassDays)));

  return {
    classDays,
    startDate: payload.startDate || payload.start_date || null,
    endDate: payload.endDate || payload.end_date || null
  };
};

export const createNewCourse = async ({ name, description, ...payload }) => {
  const { classDays, startDate, endDate } = normalizeCoursePayload(payload);

  return createCourse({
    id: createId(),
    name,
    description: description || null,
    classDays,
    startDate,
    endDate
  });
};

export const updateCourse = async (courseId, { name, description, ...payload }) => {
  const existingCourse = await findCourseById(courseId);
  if (!existingCourse) {
    throw new ApiError(404, 'Course not found.');
  }

  const nextCoursePayload = normalizeCoursePayload({
    classDays: payload.classDays ?? existingCourse.classDays,
    startDate: payload.startDate ?? existingCourse.startDate,
    endDate: payload.endDate ?? existingCourse.endDate
  });

  await query(
    'UPDATE courses SET name = ?, description = ?, class_days = ?, start_date = ?, end_date = ? WHERE id = ?',
    [
      name ?? existingCourse.name,
      description ?? existingCourse.description,
      JSON.stringify(nextCoursePayload.classDays || []),
      nextCoursePayload.startDate,
      nextCoursePayload.endDate,
      courseId
    ]
  );

  return findCourseById(courseId);
};

export const removeCourse = async (courseId) => {
  const removed = await deleteCourseById(courseId);
  if (!removed) {
    throw new ApiError(404, 'Course not found.');
  }
};

export const getCourse = async (courseId) => {
  const course = await findCourseById(courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }
  return course;
};

export const getAllCourses = async () => listCourses();
