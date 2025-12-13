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

    // Fix: Handle legacy or incorrect localhost URLs stored in DB
    // If the path contains localhost or 127.0.0.1, we strip the domain part
    if (imagePath.includes('localhost') || imagePath.includes('127.0.0.1')) {
        // Extract the path part (e.g. /images/...)
        const match = imagePath.match(/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/.*)$/);
        if (match && match[1]) {
            imagePath = match[1];
        }
    }

    // If it's a valid remote URL (not localhost), return as-is
    if ((imagePath.startsWith('http://') || imagePath.startsWith('https://')) &&
        !imagePath.includes('localhost') &&
        !imagePath.includes('127.0.0.1')) {
        return imagePath;
    }

    // Ensure the path starts with /
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    // Remove any double slashes caused by concatenation
    const baseUrl = getServerBaseUrl().replace(/\/+$/, '');

    return `${baseUrl}${normalizedPath}`;
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
