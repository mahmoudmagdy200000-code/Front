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
export const createChalet = async (chalet: Omit<Chalet, 'Id' | 'OwnerId'>, images: File[] = []): Promise<Chalet> => {
    const formData = new FormData();

    // Append standard fields
    Object.entries(chalet).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            // Check if it's the Images array from the chalet object itself (if any) and skip it, 
            // relying on the explicit 'images' argument, OR handle if the user passed it in 'chalet'.
            // For now, we assume 'chalet' is just the data fields.
            formData.append(key, value.toString());
        }
    });

    // Append files
    images.forEach((file) => {
        formData.append('Images', file);
    });

    const response = await axiosInstance.post<Chalet>('/chalets', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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
