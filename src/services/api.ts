import axios from 'axios';

// Client-side API requests hit the local Next.js proxy route middleware
// We set baseURL to /api to hit the proxy which forwards to backend's /atc
const apiClient = axios.create({
    baseURL: '/api',
});

// Request interceptor to add the standard auth token
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor to handle session expiration (401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined' && error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            sessionStorage.setItem('session_expired_msg', 'Your session has expired. Please log in again.');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
