import api from '../../../lib/api';

export const fetchBillingApi = async () => {
    const response = await api.get('/billing');
    return response.data;
};
