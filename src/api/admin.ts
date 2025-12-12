import axiosInstance from './axios';

// ==================== TYPES ====================

export interface OwnerRequest {
    Id: number;
    UserId: string;
    Username: string;
    Email: string;
    PhoneNumber: string;
    FullName: string;
    Status: string; // 'Pending' | 'Approved' | 'Rejected'
    CreatedAt: string;
    ProcessedAt: string | null;
}

export interface UserWithRole {
    UserId: string;
    Username: string;
    Email: string;
    FullName: string;
    Role: string;
    CreatedAt: string;
    LastLoginAt: string | null;
}

// ==================== OWNER REQUEST APIs (for Clients) ====================

/**
 * Request owner upgrade (Client only)
 */
export const requestOwnerUpgrade = async (): Promise<OwnerRequest> => {
    const response = await axiosInstance.post<OwnerRequest>('/auth/request-owner');
    return response.data;
};

/**
 * Get current user's pending request
 */
export const getMyOwnerRequest = async (): Promise<{ request: OwnerRequest | null }> => {
    const response = await axiosInstance.get<{ request: OwnerRequest | null }>('/auth/my-request');
    return response.data;
};

// ==================== ADMIN APIs ====================

/**
 * Get all owner requests (Admin only)
 */
export const getAllOwnerRequests = async (): Promise<OwnerRequest[]> => {
    const response = await axiosInstance.get<OwnerRequest[]>('/admin/owner-requests');
    return response.data;
};

/**
 * Approve owner request (Admin only)
 */
export const approveOwnerRequest = async (requestId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(`/admin/owner-requests/${requestId}/approve`);
    return response.data;
};

/**
 * Reject owner request (Admin only)
 */
export const rejectOwnerRequest = async (requestId: number, notes?: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(`/admin/owner-requests/${requestId}/reject`, { notes });
    return response.data;
};

/**
 * Get all users with roles (Admin only)
 */
export const getAllUsers = async (): Promise<UserWithRole[]> => {
    const response = await axiosInstance.get<UserWithRole[]>('/admin/users');
    return response.data;
};

/**
 * Upgrade user to Owner (Admin only)
 */
export const upgradeUserToOwner = async (userId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(`/admin/upgrade-to-owner/${userId}`);
    return response.data;
};

/**
 * Downgrade user to Client (Admin only)
 */
export const downgradeUserToClient = async (userId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(`/admin/downgrade-to-client/${userId}`);
    return response.data;
};
