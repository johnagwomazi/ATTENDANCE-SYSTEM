import { asyncHandler } from '../utils/asyncHandler.js';
import { enrollStudent, endProgram, getAllEnrollments, getEnrollment, updateEnrollment } from '../services/enrollmentService.js';

export const create = asyncHandler(async (req, res) => {
  const { enrollment, schedules } = await enrollStudent(req.body);
  return res.status(201).json({
    success: true,
    message: 'Enrollment created successfully.',
    data: { enrollment, schedules }
  });
});

export const list = asyncHandler(async (_req, res) => {
  const enrollments = await getAllEnrollments();
  return res.status(200).json({
    success: true,
    message: 'Enrollments retrieved successfully.',
    data: { enrollments }
  });
});

export const read = asyncHandler(async (req, res) => {
  const enrollment = await getEnrollment(req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Enrollment retrieved successfully.',
    data: { enrollment }
  });
});

export const update = asyncHandler(async (req, res) => {
  const enrollment = await updateEnrollment(req.params.id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Enrollment updated successfully.',
    data: { enrollment }
  });
});

export const endProgramController = asyncHandler(async (req, res) => {
  const enrollment = await endProgram(req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Program ended successfully.',
    data: { enrollment }
  });
});
