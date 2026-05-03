import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken && !refreshToken) {
      set({ isLoading: false });
      return;
    }

    try {
      // Her zaman DB'den taze kullanıcı bilgisi çek (status değişmiş olabilir)
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Access token geçersiz, refresh dene
      try {
        if (refreshToken) {
          const data = await authService.refreshToken(refreshToken);
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch {
        // Refresh da başarısız
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (identifier, password) => {
    const data = await authService.login(identifier, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    // Login sonrası DB'den taze user bilgisi çek (onaylı status garantilensin)
    const freshUser = await authService.getMe();
    set({ user: freshUser, isAuthenticated: true });
    return freshUser;
  },

  register: async (formData) => {
    const data = await authService.register(formData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
    return data.user;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData },
  })),
}));

export default useAuthStore;
