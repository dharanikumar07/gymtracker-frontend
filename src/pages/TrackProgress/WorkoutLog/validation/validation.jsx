/**
 * Validates a single workout set based on its metrics type.
 * Returns an object with field-specific error messages.
 */
export const validateSetFields = (set, metricsType) => {
    const errors = {};
    const weight = set.weight !== '' && set.weight !== null ? Number(set.weight) : null;
    const reps = set.reps !== '' && set.reps !== null ? Number(set.reps) : null;
    const duration = set.duration !== '' && set.duration !== null ? Number(set.duration) : null;

    switch (metricsType) {
        case 'strength':
            if (reps === null) {
                errors.reps = 'Reps are mandatory';
            } else if (reps <= 0) {
                errors.reps = 'Reps must be greater than zero';
            }

            if (weight === null) {
                errors.weight = 'Weight is mandatory';
            } else if (weight < 0) {
                errors.weight = 'Weight cannot be negative';
            }
            break;

        case 'timed_sets':
        case 'endurance':
            if (duration === null || duration === 0) {
                errors.duration = 'Duration is required';
            } else if (duration < 0) {
                errors.duration = 'Duration must be positive';
            }

            if (weight !== null && weight <= 0 && set.weight !== '') {
                errors.weight = 'Weight must be greater than zero';
            }
            break;

        default:
            break;
    }

    return errors;
};

/**
 * Validates the manual exercise addition.
 */
export const validateManualExerciseFields = (name, sets, metricsType) => {
    const errors = {
        name: !name?.trim() ? 'Exercise name is required' : null,
        sets: sets.map(s => validateSetFields(s, metricsType))
    };

    const hasSetErrors = errors.sets.some(setErrors => Object.keys(setErrors).length > 0);
    const isValid = !errors.name && !hasSetErrors;

    return { isValid, errors };
};

/**
 * Validates the skip modal reason.
 */
export const validateSkipField = (reason) => {
    if (!reason?.trim()) {
        return 'Please provide a reason for skipping';
    }
    return null;
};
