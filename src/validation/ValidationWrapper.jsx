import React, { useState, useMemo } from 'react';
import { validateForm, hasError, getError } from './index';

export const withValidation = (Component, validationSchema) => {
    return function ValidatedComponent(props) {
        const [errors, setErrors] = useState({});
        
        const validate = (data) => {
            const result = validateForm(data, validationSchema);
            setErrors(result.errors);
            return result.isValid;
        };
        
        const clearErrors = () => setErrors({});
        
        const clearFieldError = (field) => setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
        
        const validatedProps = useMemo(() => ({
            ...props,
            errors,
            validate,
            clearErrors,
            clearFieldError,
            hasError: (field) => hasError(errors, field),
            getError: (field) => getError(errors, field),
        }), [props, errors]);
        
        return <Component {...validatedProps} />;
    };
};

export const useFormValidation = (validationSchema) => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (field, value) => {
        const fieldRules = validationSchema[field] || {};
        const fieldErrors = {};
        
        fieldRules.required && !value?.trim() && (fieldErrors.required = fieldRules.requiredMessage || 'This field is required');
        fieldRules.minLength && value?.length < fieldRules.minLength && (fieldErrors.minLength = fieldRules.minLengthMessage || `Min ${fieldRules.minLength} chars`);
        fieldRules.maxLength && value?.length > fieldRules.maxLength && (fieldErrors.maxLength = fieldRules.maxLengthMessage || `Max ${fieldRules.maxLength} chars`);
        
        if (fieldRules.min !== undefined && value !== '' && value !== null) {
            const numValue = parseFloat(value);
            !isNaN(numValue) && numValue < fieldRules.min && (fieldErrors.min = fieldRules.minMessage || `Min: ${fieldRules.min}`);
        }
        
        if (fieldRules.max !== undefined && value !== '' && value !== null) {
            const numValue = parseFloat(value);
            !isNaN(numValue) && numValue > fieldRules.max && (fieldErrors.max = fieldRules.maxMessage || `Max: ${fieldRules.max}`);
        }
        
        fieldRules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && (fieldErrors.email = fieldRules.emailMessage || 'Invalid email');
        fieldRules.url && value && (() => { try { new URL(value); return false; } catch { return true; } })() && (fieldErrors.url = fieldRules.urlMessage || 'Invalid URL');
        fieldRules.pattern && value && !fieldRules.pattern.test(value) && (fieldErrors.pattern = fieldRules.patternMessage || 'Invalid format');
        fieldRules.oneOf && value && !fieldRules.oneOf.includes(value) && (fieldErrors.oneOf = fieldRules.oneOfMessage || `Must be one of: ${fieldRules.oneOf.join(', ')}`);
        
        setErrors(prev => ({
            ...prev,
            [field]: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
        }));
        
        return Object.keys(fieldErrors).length === 0;
    };

    const validateAll = (data) => {
        const result = validateForm(data, validationSchema);
        setErrors(result.errors);
        // Mark all validated fields as touched so errors are visible
        const allTouched = {};
        Object.keys(validationSchema).forEach(field => { allTouched[field] = true; });
        setTouched(prev => ({ ...prev, ...allTouched }));
        return result.isValid;
    };

    const touchField = (field) => setTouched(prev => ({ ...prev, [field]: true }));
    const clearErrors = () => setErrors({}) || setTouched({});
    const clearFieldError = (field) => setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
    });

    const getFieldProps = (field, options = {}) => ({
        error: touched[field] ? getError(errors, field) : undefined,
        onBlur: () => touchField(field),
        onChange: options.onChange,
    });

    return {
        errors,
        touched,
        validateField,
        validateAll,
        touchField,
        clearErrors,
        clearFieldError,
        hasError: (field) => hasError(errors, field) && touched[field],
        getError: (field) => touched[field] ? getError(errors, field) : undefined,
        getFieldProps,
    };
};
