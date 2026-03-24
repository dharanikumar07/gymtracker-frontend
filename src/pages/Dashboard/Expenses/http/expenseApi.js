import api from '../../../../lib/api';

export const fetchExpensesApi = async () => {
  const response = await api.get('/get-expenses');
  return response.data;
};
