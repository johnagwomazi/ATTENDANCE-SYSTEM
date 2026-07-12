import { api } from '../lib/axios';

export const adminService = {
  fetchEnrollments: async () => {
    const { data } = await api.get('/api/enrollments');
    return data;
  },
  fetchEnrolledStudents: async () => {
    const { data } = await api.get('/api/admin/students');
    return data;
  },
  fetchStudents: async () => {
    const { data } = await api.get('/api/admin/students');
    return data;
  },
  fetchUnenrolledStudents: async () => {
    const { data } = await api.get('/api/admin/students/unenrolled');
    return data;
  },
  fetchStudentAttendance: async (studentId, params = {}) => {
    const { data } = await api.get(`/api/admin/students/${studentId}/attendance`, { params });
    return data;
  },
  fetchCourses: async () => {
    const { data } = await api.get('/api/courses');
    return data;
  },
  createCourse: async (payload) => {
    const { data } = await api.post('/api/courses', payload);
    return data;
  },
  updateCourse: async (id, payload) => {
    const { data } = await api.put(`/api/courses/${id}`, payload);
    return data;
  },
  deleteCourse: async (id) => {
    const { data } = await api.delete(`/api/courses/${id}`);
    return data;
  },
  createEnrollment: async (payload) => {
    const { data } = await api.post('/api/admin/enrollments', payload);
    return data;
  },
  updateEnrollment: async (id, payload) => {
    const { data } = await api.put(`/api/enrollments/${id}`, payload);
    return data;
  },
  endProgram: async (id) => {
    const { data } = await api.patch(`/api/enrollments/${id}/end-program`);
    return data;
  },
  fetchReports: async (period, params = {}) => {
    const { data } = await api.get(`/api/reports/${period}`, { params });
    return data;
  },
  fetchSchedules: async () => {
    const { data } = await api.get('/api/schedules');
    return data;
  },
  createSchedule: async (payload) => {
    const { data } = await api.post('/api/schedules', payload);
    return data;
  }
};
