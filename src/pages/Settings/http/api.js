import api from '../../../lib/api';

export const fetchProfileApi = async () => {
    const response = await api.get('/settings/profile');
    return response.data;
};

export const updateProfileApi = async (payload) => {
    const response = await api.post('/settings/profile', payload);
    return response.data;
};

export const saveDeviceTokenApi = async (payload) => {
    const response = await api.post('/settings/device-token', payload);
    return response.data;
};

export const removeDeviceTokenApi = async (payload) => {
    const response = await api.delete('/settings/device-token', { data: payload });
    return response.data;
};
