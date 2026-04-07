import { create } from 'zustand';

const initialFormData = {
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitness_goal: 'muscle_gain',
    physical_activity_type: 'strength_training',
    plan: {
        name: 'My Transformation Plan',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true
    },
    weekly_split: {},
    fixed_expenses: [],
    track_expenses: null,
    expense_categories: [],
    expense_details: {}
};

export const useOnboardingStore = create((set) => ({
    step: 1,
    formData: initialFormData,
    stepsStatus: {
        'step-1': false,
        'step-2': false,
        'step-3': false
    },
    profileLoaded: false,

    setStep: (step) => set({ step }),
    
    updateFormData: (newData) => set((state) => ({
        formData: { ...state.formData, ...newData }
    })),

    setProfileData: (profileData) => set((state) => ({
        formData: { 
            ...state.formData,
            age: profileData.age || '',
            gender: profileData.gender || '',
            height: profileData.height || '',
            weight: profileData.weight || '',
            fitness_goal: profileData.fitness_goal || 'muscle_gain',
            physical_activity_type: profileData.physical_activity_type || 'strength_training',
        },
        profileLoaded: true
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
            },
            profileLoaded: false
        });
    },
}));
