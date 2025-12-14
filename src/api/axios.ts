import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://rsr123.runasp.net', // API backend URL from environment
    headers: {
        'Content-Type': 'application/json',
    },
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

// Response interceptor for error normalization and auto-logout on 401
/*
axiosInstance.interceptors.response.use(
    (response) => {
        // Return successful responses as-is
        return response;
    },
    (error: AxiosError) => {
        // Normalize error structure
        const normalizedError = {
            message: 'An unexpected error occurred',
            status: error.response?.status,
            data: error.response?.data,
        };

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            // Extract error message from various possible structures
            if (typeof data === 'object' && data !== null) {
                const errorData = data as any;
                normalizedError.message =
                    errorData.message ||
                    errorData.Message ||
                    errorData.title ||
                    errorData.error ||
                    'Server error occurred';

                // Handle validation errors
                if (errorData.errors) {
                    const validationErrors = Object.values(errorData.errors).flat();
                    normalizedError.message = validationErrors.join(', ');
                }
            }

            // Handle specific status codes
            switch (status) {
                case 401:
                    // Unauthorized - clear auth and redirect to login
                    normalizedError.message = 'Your session has expired. Please login again.';
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('username');
                    localStorage.removeItem('email');
                    localStorage.removeItem('fullName');
                    localStorage.removeItem('role');

                    // Redirect to login (only if not already on login/register page)
                    if (!window.location.hash.includes('/owner/login') &&
                        !window.location.hash.includes('/owner/register')) {
                        window.location.hash = '/owner/login';
                    }
                    break;

                case 403:
                    normalizedError.message = 'You do not have permission to perform this action.';
                    break;

                case 404:
                    normalizedError.message = 'The requested resource was not found.';
                    break;

                case 409:
                    // Conflict - usually from duplicate registration
                    // Message from server is usually good enough
                    break;

                case 500:
                    normalizedError.message = 'Server error. Please try again later.';
                    break;

                case 503:
                    normalizedError.message = 'Service temporarily unavailable. Please try again later.';
                    break;
            }
        } else if (error.request) {
            // Request was made but no response received
            normalizedError.message = 'Unable to connect to server. Please check your internet connection.';
        } else {
            // Something else happened
            normalizedError.message = error.message || 'An unexpected error occurred';
        }

        // Attach normalized error to the error object
        error.message = normalizedError.message;
        (error as any).normalizedError = normalizedError;

        return Promise.reject(error);
    }
);
*/

export default axiosInstance;
