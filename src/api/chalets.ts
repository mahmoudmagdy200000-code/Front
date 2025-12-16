import axiosInstance from './axios';
import type { Chalet, PagedResult } from '../types/chalet';

// Create new chalet (protected - requires auth)
export const createChalet = async (chalet: Omit<Chalet, 'Id' | 'OwnerId'>, images: File[] = []): Promise<Chalet> => {
    const formData = new FormData();

    console.log('🔍 [createChalet] Starting...');
    console.log('📋 [createChalet] Chalet data:', chalet);
    console.log('🖼️ [createChalet] Images count:', images.length);

    // Append standard fields
    Object.entries(chalet).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            console.log(`  ➕ Field: ${key} = ${value}`);
            formData.append(key, String(value));
        }
    });

    // Append files
    images.forEach((file, index) => {
        console.log(`  ➕ Image ${index}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        formData.append('Images', file);
    });

    console.log('📤 [createChalet] Sending POST request to /chalets');

    try {
        // ❌ لا تضع Content-Type هنا - دع axios يعالجها
        const response = await axiosInstance.post<Chalet>('/chalets', formData);

        console.log('✅ [createChalet] Success!', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ [createChalet] Error:', error);
        throw error;
    }
};

export interface GetChaletsParams {
    checkInDate?: string;
    checkOutDate?: string;
    minPrice?: number;
    maxPrice?: number;
    adults?: number;
    children?: number;
    isFeatured?: boolean;
    page?: number;
    pageSize?: number;
}

// Get all chalets with optional search parameters
export const getChalets = async (params: GetChaletsParams = {}): Promise<PagedResult<Chalet>> => {
    const queryParams = new URLSearchParams();
    if (params.checkInDate) queryParams.append('checkInDate', params.checkInDate);
    if (params.checkOutDate) queryParams.append('checkOutDate', params.checkOutDate);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.adults) queryParams.append('adults', params.adults.toString());
    if (params.children) queryParams.append('children', params.children.toString());
    if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());

    const response = await axiosInstance.get<PagedResult<Chalet>>('/chalets', { params: queryParams });
    return response.data;
};

// Get my chalets (owner only)
export const getMyChalets = async (): Promise<Chalet[]> => {
    const response = await axiosInstance.get<Chalet[]>('/chalets/my-chalets');
    return response.data;
};

// Get chalet by ID
export const getChaletById = async (id: number): Promise<Chalet> => {
    const response = await axiosInstance.get<Chalet>(`/chalets/${id}`);
    return response.data;
};

// Update chalet (protected - requires auth)
export const updateChalet = async (id: number, chalet: Omit<Chalet, 'Id' | 'OwnerId'>): Promise<Chalet> => {
    const response = await axiosInstance.put<Chalet>(`/chalets/${id}`, chalet);
    return response.data;
};

// Delete chalet (protected - requires auth)
export const deleteChalet = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/chalets/${id}`);
};

// Upload chalet image (protected - requires auth)
export const uploadChaletImage = async (id: number, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/chalets/${id}/upload-image`, formData);
    return response.data;
};

// Upload multiple chalet images (protected - requires auth)
export const uploadChaletImages = async (id: number, files: File[]): Promise<{ message: string; imageUrls: string[] }> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    const response = await axiosInstance.post(`/chalets/${id}/upload-images`, formData);
    return response.data;
};

// Delete chalet image (protected - requires auth)
export const deleteChaletImage = async (chaletId: number, imageId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(`/chalets/${chaletId}/images/${imageId}`);
    return response.data;
};