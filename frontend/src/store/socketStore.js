import { create } from 'zustand';
import { createSocket } from '../lib/socket';
import { SOCKET_EVENTS } from '../services/socketService';

let socketInstance = null;

export const useSocketStore = create((set, get) => ({
  liveAttendance: [],
  expiredAttempts: [],
  connected: false,

  connect: () => {
    if (socketInstance?.connected) {
      return socketInstance;
    }

    socketInstance = createSocket();

    socketInstance.on('connect', () => set({ connected: true }));
    socketInstance.on('disconnect', () => set({ connected: false }));

    socketInstance.on(SOCKET_EVENTS.ATTENDANCE_RECORDED, (payload) => {
      set((state) => ({
        liveAttendance: [payload, ...state.liveAttendance].slice(0, 50)
      }));
    });

    socketInstance.on(SOCKET_EVENTS.EXPIRED_CHECKIN_ATTEMPT, (payload) => {
      set((state) => ({
        expiredAttempts: [payload, ...state.expiredAttempts].slice(0, 30)
      }));
    });

    socketInstance.connect();
    return socketInstance;
  },

  disconnect: () => {
    if (socketInstance) {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketInstance = null;
    }
    set({ connected: false });
  }
}));
