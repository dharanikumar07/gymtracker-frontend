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
    error => {
        const { response } = error;

        // ONLY handle 401 Unauthorized errors for redirection
        if (response && response.status === 401) {
            // Token is either invalid or expired
            localStorage.removeItem('access_token');
            
            // Navigate to login only if we aren't already on an auth page
            const publicPages = ['/login', '/register', '/forgot-password', '/reset-password'];
            if (!publicPages.includes(window.location.pathname)) {
                window.location.href = '/login';
            }
        }

        // For 500 or other errors, we just pass the error through 
        // without clearing the session or redirecting.
        return Promise.reject(error);
    }
);

export default api;
