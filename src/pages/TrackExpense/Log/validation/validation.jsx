import { toast } from "sonner";

export const validateDailyExpense = (data) => {
    if (!data.name || data.name.trim() === "") {
        toast.error("Expense name is required");
        return false;
    }

    if (!data.amount || parseFloat(data.amount) <= 0) {
        toast.error("Valid amount is required");
        return false;
    }

    if (!data.category_name) {
        toast.error("Category is required");
        return false;
    }

    return true;
};
