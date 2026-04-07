import { toast } from 'sonner';

export const validateField = (value, rules) => {
    const errors = {};

    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.required = rules.requiredMessage || 'This field is required';
        return errors;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
        errors.minLength = rules.minLengthMessage || `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
        errors.maxLength = rules.maxLengthMessage || `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.min && value !== '' && value !== null && value !== undefined) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue < rules.min) {
            errors.min = rules.minMessage || `Minimum value is ${rules.min}`;
        }
    }

    if (rules.max && value !== '' && value !== null && value !== undefined) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > rules.max) {
            errors.max = rules.maxMessage || `Maximum value is ${rules.max}`;
        }
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
        errors.pattern = rules.patternMessage || 'Invalid format';
    }

    if (rules.email && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errors.email = 'Invalid email address';
        }
    }

    if (rules.url && value) {
        try {
            new URL(value);
        } catch {
            errors.url = 'Invalid URL';
        }
    }

    if (rules.oneOf && value && !rules.oneOf.includes(value)) {
        errors.oneOf = rules.oneOfMessage || `Value must be one of: ${rules.oneOf.join(', ')}`;
    }

    return errors;
};

export const validateForm = (data, validationSchema) => {
    const errors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
        const fieldErrors = validateField(data[field], validationSchema[field]);
        if (Object.keys(fieldErrors).length > 0) {
            errors[field] = fieldErrors;
            isValid = false;
        }
    });

    return { isValid, errors };
};

export const getFirstError = (errors) => {
    if (!errors || typeof errors !== 'object') return null;
    
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return null;
    
    const error = errors[firstKey];
    if (typeof error === 'string') return error;
    if (typeof error === 'object') return Object.values(error)[0];
    
    return null;
};

export const hasError = (errors, field) => {
    return errors && errors[field] && Object.keys(errors[field]).length > 0;
};

export const getError = (errors, field) => {
    if (!errors || !errors[field]) return null;
    const error = errors[field];
    if (typeof error === 'string') return error;
    if (typeof error === 'object') return Object.values(error)[0];
    return null;
};

export const useValidation = (validationSchema) => {
    const validate = (data) => {
        return validateForm(data, validationSchema);
    };

    const validateField = (field, value) => {
        return validateField(value, validationSchema[field] || {});
    };

    const validateAndShowToast = (data) => {
        const result = validate(data);
        if (!result.isValid) {
            const firstError = getFirstError(result.errors);
            if (firstError) {
                toast.error(firstError);
            }
        }
        return result;
    };

    return {
        validate,
        validateField,
        validateAndShowToast,
        hasError,
        getError
    };
};

export const validationRules = {
    required: (message = 'This field is required') => ({ required: true, requiredMessage: message }),
    minLength: (min, message) => ({ minLength: min, minLengthMessage: message }),
    maxLength: (max, message) => ({ maxLength: max, maxLengthMessage: message }),
    min: (min, message) => ({ min, minMessage: message }),
    max: (max, message) => ({ max, maxMessage: message }),
    email: (message = 'Invalid email address') => ({ email: true, emailMessage: message }),
    url: (message = 'Invalid URL') => ({ url: true, urlMessage: message }),
    pattern: (regex, message) => ({ pattern: regex, patternMessage: message }),
    oneOf: (options, message) => ({ oneOf: options, oneOfMessage: message }),
};
