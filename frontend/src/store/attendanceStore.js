import { create } from 'zustand';
import { attendanceService } from '../services/attendanceService';
import { studentService } from '../services/studentService';

const defaultStats = {
  present: 0,
  late: 0,
  absent: 0,
  total: 0,
  attendancePercentage: 0
};

const deriveStats = (items = []) => {
  const counts = items.reduce(
    (acc, item) => {
      acc.total += 1;
      const normalized = String(item.status || '').toLowerCase();
      if (normalized === 'absent') {
        acc.absent += 1;
      } else {
        acc.present += 1;
        if (item.isLate || normalized === 'late') {
          acc.late += 1;
        }
      }
      return acc;
    },
    { ...defaultStats }
  );
  counts.attendancePercentage = counts.total ? Math.round((counts.present / counts.total) * 100) : 0;
  return counts;
};

export const useAttendanceStore = create((set, get) => ({
  todayAttendance: [],
  attendanceHistory: [],
  statistics: defaultStats,
  loading: false,

  checkIn: async (token) => {
    set({ loading: true });
    try {
      const response = await attendanceService.checkIn(token);
      const attendance = response?.data?.attendance || response?.attendance || null;
      const event = response?.data?.event || {};
      const record = {
        id: attendance?.id || `${Date.now()}`,
        studentName: event.studentName || '',
        course: event.course || '',
        time: event.time || attendance?.check_in_time || '',
        status: attendance?.status || event.status || 'present',
        isLate: Boolean(attendance?.is_late || event.isLate),
        date: new Date().toISOString()
      };
      const nextHistory = [record, ...get().attendanceHistory].slice(0, 200);
      const nextToday = [record, ...get().todayAttendance].slice(0, 20);
      set({
        todayAttendance: nextToday,
        attendanceHistory: nextHistory,
        statistics: deriveStats(nextHistory),
        loading: false
      });
      return { response, record };
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchHistory: async (params = {}) => {
    const response = await studentService.fetchAttendanceHistory(params);
    const items = response?.data?.records || response?.records || [];
    set({
      attendanceHistory: items,
      statistics: {
        ...defaultStats,
        present: response?.data?.summary?.presentCount || response?.summary?.presentCount || 0,
        late: response?.data?.summary?.lateCount || response?.summary?.lateCount || 0,
        absent: response?.data?.summary?.absentCount || response?.summary?.absentCount || 0,
        total: response?.data?.summary?.totalAttendance || response?.summary?.totalAttendance || items.length,
        attendancePercentage: response?.data?.summary?.attendancePercentage || response?.summary?.attendancePercentage || 0
      }
    });
    return items;
  },

  fetchStats: async (params = {}) => {
    const response = await studentService.fetchAttendanceHistory(params);
    const summary = response?.data?.summary || response?.summary || {};
    const stats = {
      present: summary.presentCount || 0,
      late: summary.lateCount || 0,
      absent: summary.absentCount || 0,
      total: summary.totalAttendance || 0,
      attendancePercentage: summary.attendancePercentage || 0
    };
    set({ statistics: stats });
    return stats;
  },

  appendLiveRecord: (record) => {
    const nextHistory = [record, ...get().attendanceHistory].slice(0, 200);
    set({
      todayAttendance: [record, ...get().todayAttendance].slice(0, 20),
      attendanceHistory: nextHistory,
      statistics: deriveStats(nextHistory)
    });
  }
}));
