import { asyncHandler } from '../utils/asyncHandler.js';
import { createNewCourse, getAllCourses, getCourse, removeCourse, updateCourse } from '../services/courseService.js';

export const create = asyncHandler(async (req, res) => {
  const course = await createNewCourse(req.body);
  return res.status(201).json({
    success: true,
    message: 'Course created successfully.',
    data: { course }
  });
});

export const list = asyncHandler(async (_req, res) => {
  const courses = await getAllCourses();
  return res.status(200).json({
    success: true,
    message: 'Courses retrieved successfully.',
    data: { courses }
  });
});

export const read = asyncHandler(async (req, res) => {
  const course = await getCourse(req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Course retrieved successfully.',
    data: { course }
  });
});

export const update = asyncHandler(async (req, res) => {
  const course = await updateCourse(req.params.id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Course updated successfully.',
    data: { course }
  });
});

export const remove = asyncHandler(async (req, res) => {
  await removeCourse(req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Course deleted successfully.'
  });
});
