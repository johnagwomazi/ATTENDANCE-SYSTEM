import { asyncHandler } from '../utils/asyncHandler.js';
import { enrollStudent, getEnrolledStudents, getUnenrolledStudents } from '../services/enrollmentService.js';

export const listUnenrolledStudents = asyncHandler(async (_req, res) => {
  const students = await getUnenrolledStudents();
  return res.status(200).json({
    success: true,
    message: 'Unenrolled students retrieved successfully.',
    data: { students }
  });
});

export const listEnrolledStudents = asyncHandler(async (_req, res) => {
  const students = await getEnrolledStudents();
  return res.status(200).json({
    success: true,
    message: 'Enrolled students retrieved successfully.',
    data: { students }
  });
});

export const createEnrollment = asyncHandler(async (req, res) => {
  const { enrollment, schedules } = await enrollStudent(req.body);
  return res.status(201).json({
    success: true,
    message: 'Enrollment created successfully.',
    data: { enrollment, schedules }
  });
});
