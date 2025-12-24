import axios from 'axios';
import { getServerBaseUrl } from '../config/api';

const axiosInstance = axios.create({
    baseURL: getServerBaseUrl(),
    timeout: 120000,
    withCredentials: true,
});

// Request interceptor to include JWT token and fix API path
axiosInstance.interceptors.request.use(
    (config) => {
        // Ensure path starts with /api
        if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
            config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
        }

        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ لا تضع Content-Type يدوياً للـ FormData
        // دع axios يتعامل معها تلقائياً
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        console.log('📤 [AXIOS] Request:', {
            method: config.method,
            url: config.url,
            hasAuth: !!token,
            isFormData: config.data instanceof FormData,
            headers: config.headers,
        });

        return config;
    },
    (error) => {
        console.error('❌ [AXIOS] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ [AXIOS] Response:', {
            status: response.status,
            url: response.config.url,
            dataLength: JSON.stringify(response.data).length,
        });
        return response;
    },
    (error) => {
        console.error('❌ [AXIOS] Response error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
        });

        // معالجة أخطاء محددة
        if (error.response?.status === 401) {
            // Unauthorized - لا تقم بإعادة التوجيه إذا كان الخطأ من صفحة تسجيل الدخول نفسها
            if (!error.config.url.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/owner/login'; // Redirect to correct login page
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;