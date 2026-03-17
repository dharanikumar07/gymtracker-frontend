import api from '../../../lib/api';

export const loginApi = async (credentials) => {
    return await api.post('/login', credentials);
};

export const registerApi = async (userData) => {
    return await api.post('/register', userData);
};

export const logoutApi = async () => {
    return await api.post('/logout');
};

export const fetchMeApi = async () => {
    return await api.get('/me');
};

export const forgotPasswordApi = async (data) => {
    return await api.post('/forgot-password', data);
};

export const resetPasswordApi = async (data) => {
    return await api.post('/reset-password', data);
};

export const verifyEmailApi = async (uuid, hash) => {
    return await api.get(`/verify-email/${uuid}/${hash}`);
};

export const getSocialRedirectApi = async (provider) => {
    return await api.get(`/auth/redirect/${provider}`);
};

export const socialCallbackApi = async (provider, code) => {
    // Send provider and code in the body for a clean API
    return await api.get(`/auth/callback/${provider}`, { 
        params: { provider, code } 
    });
};
