import api from '../../../../lib/api';

export const getExpenseLogApi = (date) => 
    api.get(`/log?date=${date}`);

export const getAvailableCategoriesApi = (plan_uuid) => 
    api.get('/get-available-categories', { params: { plan_uuid } });

export const logExpenseApi = (data) => 
    api.post('/log', data);

export const deleteExpenseLogApi = (uuid) => 
    api.delete(`/log/${uuid}`);
