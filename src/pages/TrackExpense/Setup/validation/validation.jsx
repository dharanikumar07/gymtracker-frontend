import { toast } from "sonner";

export const validateBudgetPlan = (plan) => {
    const errors = {};

    if (!plan.name?.trim()) {
        errors.name = "Plan name is required";
    }

    if (!plan.meta_data?.amount || plan.meta_data.amount <= 0) {
        errors.amount = "Budget amount is required";
    }

    if (!plan.start_date) {
        errors.start_date = "Start date is required";
    }

    if (!plan.end_date) {
        errors.end_date = "End date is required";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateFixedExpenses = (expenses) => {
    const errors = {};
    
    expenses.forEach((exp) => {
        const id = exp.uuid || exp.id;
        if (!exp.category_name?.trim()) {
            errors[`${id}_name`] = "Name is required";
        }
        if (!exp.default_amount || parseFloat(exp.default_amount) <= 0) {
            errors[id] = "Amount is required";
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
