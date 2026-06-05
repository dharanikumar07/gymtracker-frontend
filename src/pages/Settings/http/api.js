import api from '../../../lib/api';

export const fetchProfileApi = async () => {
    const response = await api.get('/settings/profile');
    return response.data;
};

export const updateProfileApi = async (payload) => {
    const response = await api.post('/settings/profile', payload);
    return response.data;
};
