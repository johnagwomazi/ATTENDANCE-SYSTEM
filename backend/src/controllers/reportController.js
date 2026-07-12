import { asyncHandler } from '../utils/asyncHandler.js';
import { getReportForMonth, getReportForToday, getReportForWeek } from '../services/reportService.js';

const extractFilters = (req) => ({
  courseId: req.query.courseId || null,
  studentId: req.query.studentId || null,
  from: req.query.from || null,
  to: req.query.to || null
});

export const today = asyncHandler(async (req, res) => {
  const report = await getReportForToday(extractFilters(req));
  return res.status(200).json({
    success: true,
    message: 'Today report retrieved successfully.',
    data: report
  });
});

export const weekly = asyncHandler(async (req, res) => {
  const report = await getReportForWeek(extractFilters(req));
  return res.status(200).json({
    success: true,
    message: 'Weekly report retrieved successfully.',
    data: report
  });
});

export const monthly = asyncHandler(async (req, res) => {
  const report = await getReportForMonth(extractFilters(req));
  return res.status(200).json({
    success: true,
    message: 'Monthly report retrieved successfully.',
    data: report
  });
});
