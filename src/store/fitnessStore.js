import { create } from 'zustand';
import { fetchRoutineApi } from '../pages/Dashboard/Progress/http/progressApi';

export const useFitnessStore = create((set, get) => ({
    routine: null,
    loading: false,
    error: null,

    fetchRoutine: async () => {
        set({ loading: true });
        try {
            const routine = await fetchRoutineApi();
            set({ routine, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    setRoutine: (routine) => set({ routine }),
}));
