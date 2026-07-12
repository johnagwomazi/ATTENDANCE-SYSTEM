import { create } from 'zustand';
import { adminService } from '../services/adminService';

const unwrapStudents = (students = []) => students.map((student) => ({
  ...student,
  id: student.studentId || student.id
}));

export const useAdminStore = create((set) => ({
  students: [],
  enrolledStudents: [],
  unenrolledStudents: [],
  courses: [],
  enrollments: [],
  reports: {
    today: null,
    weekly: null,
    monthly: null
  },
  schedules: [],
  loading: false,

  createCourse: async (payload) => {
    const response = await adminService.createCourse(payload);
    await useAdminStore.getState().fetchCourses();
    return response;
  },

  updateCourse: async (id, payload) => {
    const response = await adminService.updateCourse(id, payload);
    await useAdminStore.getState().fetchCourses();
    return response;
  },

  deleteCourse: async (id) => {
    const response = await adminService.deleteCourse(id);
    await useAdminStore.getState().fetchCourses();
    return response;
  },

  createEnrollment: async (payload) => {
    const response = await adminService.createEnrollment(payload);
    await Promise.all([
      useAdminStore.getState().fetchStudents(),
      useAdminStore.getState().fetchEnrollments()
    ]);
    return response;
  },

  updateEnrollment: async (id, payload) => {
    const response = await adminService.updateEnrollment(id, payload);
    await useAdminStore.getState().fetchEnrollments();
    return response;
  },

  endProgram: async (id) => {
    const response = await adminService.endProgram(id);
    await useAdminStore.getState().fetchEnrollments();
    return response;
  },

  createSchedule: async (payload) => {
    const response = await adminService.createSchedule(payload);
    await useAdminStore.getState().fetchSchedules();
    return response;
  },

  fetchStudents: async () => {
    const response = await adminService.fetchStudents();
    const students = unwrapStudents(response?.data?.students || response?.students || []);
    set({
      students,
      enrolledStudents: students
    });
    return students;
  },

  fetchUnenrolledStudents: async () => {
    const response = await adminService.fetchUnenrolledStudents();
    const unenrolledStudents = response?.data?.students || response?.students || [];
    set({ unenrolledStudents });
    return unenrolledStudents;
  },

  fetchEnrolledStudents: async () => {
    const response = await adminService.fetchStudents();
    const enrolledStudents = unwrapStudents(response?.data?.students || response?.students || []);
    set({
      students: enrolledStudents,
      enrolledStudents
    });
    return enrolledStudents;
  },

  fetchCourses: async () => {
    const response = await adminService.fetchCourses();
    const courses = response?.data?.courses || response?.courses || [];
    set({ courses });
    return courses;
  },

  fetchEnrollments: async () => {
    const response = await adminService.fetchEnrollments();
    const enrollments = response?.data?.enrollments || response?.enrollments || [];
    set({ enrollments });
    return enrollments;
  },

  fetchReports: async () => {
    const [today, weekly, monthly] = await Promise.all([
      adminService.fetchReports('today'),
      adminService.fetchReports('weekly'),
      adminService.fetchReports('monthly')
    ]);

    set({
      reports: {
        today: today?.data || today,
        weekly: weekly?.data || weekly,
        monthly: monthly?.data || monthly
      }
    });
  },

  fetchSchedules: async () => {
    const response = await adminService.fetchSchedules();
    const schedules = response?.data?.schedules || response?.schedules || [];
    set({ schedules });
    return schedules;
  }
}));
