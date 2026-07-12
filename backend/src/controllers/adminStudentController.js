import { asyncHandler } from '../utils/asyncHandler.js';
import { getAllStudentSummaries } from '../services/enrollmentService.js';
import { getStudentAttendanceHistory } from '../services/studentService.js';

export const listAllStudents = asyncHandler(async (_req, res) => {
  const students = await getAllStudentSummaries();
  return res.status(200).json({
    success: true,
    message: 'Students retrieved successfully.',
    data: { students }
  });
});

export const getStudentAttendance = asyncHandler(async (req, res) => {
  const { courseId = null, from = null, to = null, status = null } = req.query;
  const report = await getStudentAttendanceHistory(req.params.id, {
    courseId: courseId || null,
    from: from || null,
    to: to || null,
    status: status || null
  });

  return res.status(200).json({
    success: true,
    message: 'Student attendance retrieved successfully.',
    data: report
  });
});
