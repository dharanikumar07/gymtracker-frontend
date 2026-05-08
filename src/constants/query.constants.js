export const QUERY_KEYS = {
  AUTH: {
    USER: ['auth', 'user'],
    VERIFY_EMAIL: (uuid, hash) => ['auth', 'verify-email', uuid, hash],
  },
  DASHBOARD: {
    ALL: ['dashboard'],
  },
  EXPENSES: {
    ALL: ['expenses'],
    BUDGET_PLANS: ['expenses', 'budget-plans'],
    BUDGET_STATUS: ['expenses', 'budget-status'],
  },
  PROGRESS: {
    ROUTINE: ['progress', 'routine'],
    ROUTINE_BY_PLAN: (planUuid) => ['progress', 'routine', planUuid],
    ROUTINE_TRACKING: (date) => ['progress', 'routine-tracking', date],
    WORKOUT_LOG: (planUuid, date, day) => ['progress', 'workout-log', planUuid, date, day],
    DIET_ROUTINE: (planUuid) => ['progress', 'diet-routine', planUuid],
    DIET_TRACKING: (date) => ['progress', 'diet-tracking', date],
    DIET_LOG: (planUuid, date, day) => ['progress', 'diet-log', planUuid, date, day],
  },
  ONBOARDING: {
    PROFILE: ['onboarding', 'profile'],
    PHYSICAL_ACTIVITY: (activityType) => ['onboarding', 'physical-activity', activityType],
    EXPENSES: ['onboarding', 'expenses'],
  },
};
