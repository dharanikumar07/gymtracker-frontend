export const validateNewPlanCard = (data) => {
    const errors = {};

    if (!data.name || data.name.trim() === "") {
        errors.name = "Plan name is required";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
