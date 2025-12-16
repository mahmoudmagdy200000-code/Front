import axios from 'axios';




const axiosInstance = axios.create({
    //baseURL: import.meta.env.VITE_API_URL,//|| 'https://rsr123.runasp.net',
    //baseURL: import.meta.env.VITE_API_URL || 'https://rsr123.runasp.net',
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5266/api',
    timeout: 120000, // ⬆️ زيادة الـ timeout إلى 120 ثانية (للملفات الكبيرة)
    withCredentials: true, // ✅ للسماح بـ CORS مع credentials
});

// Request interceptor to include JWT token
axiosInstance.interceptors.request.use(
    (config) => {
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