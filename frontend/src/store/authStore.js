import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  loading: true,

  login: async (payload) => {
    const response = await authService.login(payload);
    const user = response?.data?.user || response?.user || null;
    set({
      user,
      role: user?.role || null,
      isAuthenticated: true,
      loading: false
    });
    return response;
  },

  register: async (payload) => {
    const response = await authService.register(payload);
    const user = response?.data?.user || response?.user || null;
    set({
      user,
      role: user?.role || 'student',
      isAuthenticated: true,
      loading: false
    });
    return response;
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      loading: false
    });
  },

  fetchCurrentUser: async () => {
    try {
      const response = await authService.me();
      const user = response?.data?.user || response?.user || null;
      set({
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        loading: false
      });
      return user;
    } catch {
      set({ user: null, role: null, isAuthenticated: false, loading: false });
      return null;
    }
  },

  resetAuth: () => set({ user: null, role: null, isAuthenticated: false, loading: false })
}));
