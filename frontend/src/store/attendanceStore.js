import { create } from 'zustand';
import { attendanceService } from '../services/attendanceService';
import { pushHistory, loadHistory } from '../utils/storage';
import { formatClock } from '../utils/format';

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
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { ...defaultStats }
  );
  counts.attendancePercentage = counts.total ? Math.round(((counts.present + counts.late) / counts.total) * 100) : 0;
  return counts;
};

export const useAttendanceStore = create((set, get) => ({
  todayAttendance: [],
  attendanceHistory: loadHistory(),
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
        date: new Date().toISOString()
      };
      const nextHistory = pushHistory(record);
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

  fetchHistory: async () => {
    const items = loadHistory();
    set({
      attendanceHistory: items,
      statistics: deriveStats(items)
    });
    return items;
  },

  fetchStats: async () => {
    const items = loadHistory();
    const stats = deriveStats(items);
    set({ statistics: stats });
    return stats;
  },

  appendLiveRecord: (record) => {
    const nextHistory = pushHistory(record);
    set({
      todayAttendance: [record, ...get().todayAttendance].slice(0, 20),
      attendanceHistory: nextHistory,
      statistics: deriveStats(nextHistory)
    });
  }
}));
