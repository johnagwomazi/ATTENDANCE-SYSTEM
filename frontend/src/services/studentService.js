import { api } from '../lib/axios';

export const studentService = {
  fetchDashboard: async () => {
    const { data } = await api.get('/api/students/me/dashboard');
    return data;
  },
  fetchEnrollments: async () => {
    const { data } = await api.get('/api/students/me/enrollments');
    return data;
  },
  fetchSchedules: async () => {
    const { data } = await api.get('/api/students/me/schedules');
    return data;
  },
  fetchAttendanceSummary: async () => {
    const { data } = await api.get('/api/students/me/attendance-summary');
    return data;
  },
  fetchAttendanceHistory: async (params = {}) => {
    const { data } = await api.get('/api/students/me/attendance', { params });
    return data;
  }
};
