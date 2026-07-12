import { ApiError } from '../utils/apiError.js';
import { createId } from '../utils/uuid.js';
import { query } from '../config/db.js';
import { createCourse, deleteCourseById, findCourseById, listCourses } from '../models/courseModel.js';

export const createNewCourse = async ({ name, description }) => {
  return createCourse({
    id: createId(),
    name,
    description: description || null
  });
};

export const updateCourse = async (courseId, { name, description }) => {
  const existingCourse = await findCourseById(courseId);
  if (!existingCourse) {
    throw new ApiError(404, 'Course not found.');
  }

  await query(
    'UPDATE courses SET name = ?, description = ? WHERE id = ?',
    [name ?? existingCourse.name, description ?? existingCourse.description, courseId]
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
