import api from '../../../lib/api';

export const fetchUserApi = async () => {
    const response = await api.get('/me');
    return response.data;
};

export const updateUserApi = async (data) => {
    const response = await api.patch('/me', data);
    return response.data;
};
