import { api } from '../lib/axios';

export const attendanceService = {
  createSession: async () => {
    const { data } = await api.post('/api/attendance-sessions/create');
    return data;
  },
  checkIn: async (token) => {
    const { data } = await api.post('/api/attendance/checkin', { token });
    return data;
  },
  todayReport: async (params = {}) => {
    const { data } = await api.get('/api/reports/today', { params });
    return data;
  },
  weeklyReport: async (params = {}) => {
    const { data } = await api.get('/api/reports/weekly', { params });
    return data;
  },
  monthlyReport: async (params = {}) => {
    const { data } = await api.get('/api/reports/monthly', { params });
    return data;
  }
};
