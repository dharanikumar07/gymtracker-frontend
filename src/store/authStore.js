import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    loading: !!localStorage.getItem('access_token'),

    fetchUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            set({ user: null, loading: false });
            return null;
        }

        try {
            const response = await api.get('/me');
            const userData = response.data.data || response.data.user || response.data;
            set({ user: userData, loading: false });
            return userData;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // If the access_token is invalid and refresh failed, api.js would have cleared it
            // but we can double check here
            if (error.response?.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                set({ user: null, loading: false });
            }
            set({ loading: false });
            return null;
        }
    },

    login: async (userData, accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        set({ user: userData, loading: false });
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null });
            window.location.href = '/login';
        }
    },

    setUser: (user) => set({ user, loading: false }),
    setLoading: (loading) => set({ loading }),
}));
