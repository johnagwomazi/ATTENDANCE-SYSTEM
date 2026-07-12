import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getStudentAttendanceSummary,
  getStudentAttendanceHistory,
  getStudentEnrollments,
  getStudentSchedules,
  getStudentDashboardOverview
} from '../services/studentService.js';

export const myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await getStudentEnrollments(req.user.id);
  return res.status(200).json({
    success: true,
    message: 'Student enrollments retrieved successfully.',
    data: { enrollments }
  });
});

export const mySchedules = asyncHandler(async (req, res) => {
  const schedules = await getStudentSchedules(req.user.id);
  return res.status(200).json({
    success: true,
    message: 'Student schedules retrieved successfully.',
    data: { schedules }
  });
});

export const myAttendanceSummary = asyncHandler(async (req, res) => {
  const summary = await getStudentAttendanceSummary(req.user.id);
  return res.status(200).json({
    success: true,
    message: 'Student attendance summary retrieved successfully.',
    data: { summary }
  });
});

export const myDashboard = asyncHandler(async (req, res) => {
  const overview = await getStudentDashboardOverview(req.user.id);
  return res.status(200).json({
    success: true,
    message: 'Student dashboard data retrieved successfully.',
    data: overview
  });
});

export const myAttendanceHistory = asyncHandler(async (req, res) => {
  const { courseId = null, from = null, to = null, status = null } = req.query;
  const history = await getStudentAttendanceHistory(req.user.id, {
    courseId: courseId || null,
    from: from || null,
    to: to || null,
    status: status || null
  });

  return res.status(200).json({
    success: true,
    message: 'Student attendance history retrieved successfully.',
    data: history
  });
});
