export const validateDietLog = (logs) => {
    for (const log of logs) {
        if (log.calories < 0 || log.protein < 0 || log.carbs < 0 || log.fats < 0) {
            return { isValid: false, message: 'Macros cannot be negative' };
        }
    }
    return { isValid: true };
};

export const validateSkipField = (reason) => {
    if (!reason || reason.trim().length < 3) {
        return { isValid: false, message: 'Please provide a valid reason (min 3 chars)' };
    }
    return { isValid: true };
};
