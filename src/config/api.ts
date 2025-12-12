/**
 * API Configuration Utilities
 * Centralized utilities for API URL management
 */

/**
 * Get the base API URL from environment variables
 * Falls back to production URL if not set
 */
export const getApiBaseUrl = (): string => {
    return import.meta.env.VITE_API_URL || 'https://rsr123.runasp.net/api';
};

/**
 * Get the API server URL without the /api suffix
 * For use with static files like images
 */
export const getServerBaseUrl = (): string => {
    const apiUrl = getApiBaseUrl();
    // Remove /api from the end to get server base URL
    return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Get the full URL for an image
 * @param imagePath - The image path from the API (e.g., /uploads/images/xxx.jpg)
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) {
        return '';
    }

    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Ensure the path starts with /
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${getServerBaseUrl()}${normalizedPath}`;
};

/**
 * Environment information
 */
export const isDevelopment = (): boolean => {
    return import.meta.env.DEV;
};

export const isProduction = (): boolean => {
    return import.meta.env.PROD;
};

/**
 * Log API configuration (for debugging)
 */
export const logApiConfig = (): void => {
    console.log('🔧 API Configuration:');
    console.log('  - Mode:', import.meta.env.MODE);
    console.log('  - API Base URL:', getApiBaseUrl());
    console.log('  - Server Base URL:', getServerBaseUrl());
    console.log('  - Is Development:', isDevelopment());
    console.log('  - Is Production:', isProduction());
};
