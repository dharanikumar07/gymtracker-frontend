import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialFormData = {
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitness_goal: 'muscle_gain',
    physical_activity_type: 'strength_training',
    weekly_split: {},
    track_expenses: null,
    expense_categories: [],
    expense_details: {}
};

export const useOnboardingStore = create(
    persist(
        (set) => ({
            step: 1,
            formData: initialFormData,
            stepsStatus: {
                'step-1': false,
                'step-2': false,
                'step-3': false
            },

            setStep: (step) => set({ step }),
            
            updateFormData: (newData) => set((state) => ({
                formData: { ...state.formData, ...newData }
            })),

            setStepsStatus: (status) => set((state) => ({
                stepsStatus: { ...state.stepsStatus, ...status }
            })),

            resetOnboarding: () => {
                set({ 
                    step: 1, 
                    formData: initialFormData,
                    stepsStatus: {
                        'step-1': false,
                        'step-2': false,
                        'step-3': false
                    }
                });
                localStorage.removeItem('onboarding-storage');
            },
        }),
        {
            name: 'onboarding-storage', // key in localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
