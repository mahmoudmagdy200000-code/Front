import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://rsr123.runasp.net', // API backend URL from environment
    // headers: {
    //     'Content-Type': 'application/json',
    // },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor to include JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default axiosInstance;
