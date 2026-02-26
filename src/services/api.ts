import axios from 'axios';

// Client-side API requests hit the local Next.js proxy route middleware
// We set baseURL to /api/atc to hit the proxy which forwards to backend's /atc
const apiClient = axios.create({
    baseURL: '/api/atc',
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

export default apiClient;
