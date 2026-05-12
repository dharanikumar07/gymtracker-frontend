import api from '../../../../lib/api';

export const fetchExpensesApi = async (date) => {
    const response = await api.get('/expenses', { params: { date } });
    return response.data;
};

export const saveExpenseCategoryApi = async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
};

export const deleteExpenseCategoryApi = async (uuid) => {
    const response = await api.delete(`/expenses/${uuid}`);
    return response.data;
};
