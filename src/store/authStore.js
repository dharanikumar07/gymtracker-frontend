import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
    user: null,
    loading: true,

    fetchUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            set({ loading: false });
            return;
        }

        try {
            const response = await api.get('/me');
            const userData = response.data.data || response.data.user || response.data;
            set({ user: userData, loading: false });
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('access_token');
            set({ user: null, loading: false });
        }
    },

    login: (userData, token) => {
        localStorage.setItem('access_token', token);
        const extractedUser = userData.data || userData.user || userData;
        set({ user: extractedUser });
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            set({ user: null });
        }
    },

    setUser: (user) => set({ user }),
}));
