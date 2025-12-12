import axiosInstance from './axios';
import type { Chalet } from '../types/chalet';

// Get all chalets with optional search parameters
export const getChalets = async (checkInDate?: string, checkOutDate?: string, maxPrice?: number, adults?: number, children?: number): Promise<Chalet[]> => {
    const params = new URLSearchParams();
    if (checkInDate) params.append('checkInDate', checkInDate);
    if (checkOutDate) params.append('checkOutDate', checkOutDate);
    if (maxPrice) params.append('maxPrice', maxPrice.toString());
    if (adults) params.append('adults', adults.toString());
    if (children) params.append('children', children.toString());

    const response = await axiosInstance.get<Chalet[]>('/chalets', { params });
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

// Create new chalet (protected - requires auth)
export const createChalet = async (chalet: Omit<Chalet, 'Id' | 'OwnerId'>): Promise<Chalet> => {
    const response = await axiosInstance.post<Chalet>('/chalets', chalet);
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
    const response = await axiosInstance.post<{ imageUrl: string }>(`/chalets/${id}/upload-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Upload multiple chalet images (protected - requires auth)
export const uploadChaletImages = async (id: number, files: File[]): Promise<{ message: string; imageUrls: string[] }> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    const response = await axiosInstance.post<{ message: string; imageUrls: string[] }>(`/chalets/${id}/upload-images`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Delete chalet image (protected - requires auth)
export const deleteChaletImage = async (chaletId: number, imageId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(`/chalets/${chaletId}/images/${imageId}`);
    return response.data;
};
