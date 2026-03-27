import api from '../../../lib/api';

export const fetchExpensesApi = async (date) => {
    const response = await api.get('/expenses', { params: { date } });
    return response.data;
};

export const logExpenseApi = async (data) => {
    const response = await api.post('/expenses/log', data);
    return response.data;
};

export const deleteExpenseApi = async (uuid) => {
    const response = await api.delete(`/expenses/${uuid}`);
    return response.data;
};

export const fetchBudgetPlansApi = async () => {
    const response = await api.get('/expenses/budget-plan');
    return response.data;
};

export const createBudgetPlanApi = async (data) => {
    const response = await api.post('/expenses/budget-plan', data);
    return response.data;
};

export const updateBudgetPlanApi = async (uuid, data) => {
    const response = await api.patch(`/expenses/budget-plan/${uuid}`, data);
    return response.data;
};

export const deleteBudgetPlanApi = async (uuid) => {
    const response = await api.delete(`/expenses/budget-plan/${uuid}`);
    return response.data;
};

export const activateBudgetPlanApi = async (uuid) => {
    const response = await api.post(`/expenses/budget-plan/${uuid}/activate`);
    return response.data;
};

export const getBudgetPlanStatusApi = async (uuid) => {
    const response = await api.get(`/expenses/budget-plan/status/${uuid}`);
    return response.data;
};
