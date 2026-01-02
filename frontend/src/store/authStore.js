import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const response = await authAPI.login(email, password);
    const { user, access_token, refresh_token } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    set({ user, isAuthenticated: true });
    return user;
  },

  register: async (userData) => {
    const response = await authAPI.register(userData);
    const { user, access_token, refresh_token } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    set({ user, isAuthenticated: true });
    return user;
  },

  loginWithGoogle: async (credential) => {
    const response = await authAPI.googleLogin(credential);
    console.log('Google login response:', response.data);
    const { user, access_token, refresh_token } = response.data;
    console.log('Access token (first 50 chars):', access_token?.substring(0, 50));
    console.log('Token segments:', access_token?.split('.').length);

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    // Verify it was saved correctly
    console.log('Saved token (first 50 chars):', localStorage.getItem('access_token')?.substring(0, 50));

    set({ user, isAuthenticated: true });
    return user;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    const response = await authAPI.updateMe(data);
    set({ user: response.data.user });
    return response.data.user;
  },

  isOperator: () => {
    const { user } = get();
    return user?.role === 'operator' || user?.role === 'admin';
  },

  isParent: () => {
    const { user } = get();
    return user?.role === 'parent';
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin';
  },
}));

export default useAuthStore;
