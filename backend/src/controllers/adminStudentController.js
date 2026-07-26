import { asyncHandler } from '../utils/asyncHandler.js';
import { getAllStudentSummaries } from '../services/enrollmentService.js';
import { getStudentAttendanceHistory, getStudentDashboardOverview } from '../services/studentService.js';

export const listAllStudents = asyncHandler(async (_req, res) => {
  const students = await getAllStudentSummaries();
  return res.status(200).json({
    success: true,
    message: 'Students retrieved successfully.',
    data: { students }
  });
});

export const getStudentAttendance = asyncHandler(async (req, res) => {
  const { courseId = null, from = null, to = null, status = null, search = null } = req.query;
  const report = await getStudentAttendanceHistory(req.params.id, {
    courseId: courseId || null,
    from: from || null,
    to: to || null,
    status: status || null,
    search: search || null
  });

  return res.status(200).json({
    success: true,
    message: 'Student attendance retrieved successfully.',
    data: report
  });
});

export const getStudentProfile = asyncHandler(async (req, res) => {
  const { courseId = null, from = null, to = null, status = null, search = null } = req.query;
  const [overview, attendance] = await Promise.all([
    getStudentDashboardOverview(req.params.id),
    getStudentAttendanceHistory(req.params.id, {
      courseId: courseId || null,
      from: from || null,
      to: to || null,
      status: status || null,
      search: search || null
    })
  ]);

  return res.status(200).json({
    success: true,
    message: 'Student profile retrieved successfully.',
    data: {
      student: overview.student,
      status: overview.status,
      courseSummary: overview.courseSummary,
      activeCourseNames: overview.activeCourseNames,
      programStartDate: overview.programStartDate,
      programEndDate: overview.programEndDate,
      enrollments: overview.enrollments,
      activeEnrollments: overview.activeEnrollments,
      attendanceSummary: attendance.summary,
      attendanceRecords: attendance.records,
      attendanceRange: attendance.range,
      attendanceFilters: attendance.filters
    }
  });
});
