import { getAttendanceReport } from './attendanceService.js';

export const getReportForToday = async (filters) => getAttendanceReport({ type: 'today', ...filters });
export const getReportForWeek = async (filters) => getAttendanceReport({ type: 'weekly', ...filters });
export const getReportForMonth = async (filters) => getAttendanceReport({ type: 'monthly', ...filters });
