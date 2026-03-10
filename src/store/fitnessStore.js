import { create } from 'zustand';
import api from '../lib/api';

export const useFitnessStore = create((set, get) => ({
    routine: null,
    loading: false,
    error: null,

    fetchRoutine: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/routine');
            set({ routine: response.data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    setRoutine: (routine) => set({ routine }),
}));
