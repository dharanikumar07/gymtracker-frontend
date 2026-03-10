import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Attach Bearer token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle responses and specific authentication errors
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('refresh_token');
            const publicPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
            
            // Don't try to refresh on public pages or if no refresh token
            if (!publicPages.some(page => window.location.pathname.startsWith(page)) && refreshToken) {
                originalRequest._retry = true;
                try {
                    // Use a clean axios instance for refresh to avoid interceptor loop
                    const refreshResponse = await axios.post('http://127.0.0.1:8000/api/refresh', {}, {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`,
                            'Accept': 'application/json'
                        }
                    });

                    const { access_token, refresh_token } = refreshResponse.data;
                    
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', refresh_token);
                    
                    // Update header and retry the original request
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token is also invalid or expired
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
