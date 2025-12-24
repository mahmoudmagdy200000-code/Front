import axiosInstance from './axios';
import type { Booking } from '../types/booking';

// Check availability
export const checkAvailability = async (
    chaletId: number,
    checkInDate: string,
    checkOutDate: string
): Promise<{ IsAvailable: boolean }> => {
    const response = await axiosInstance.get('/bookings/available', {
        params: { chaletId, checkInDate, checkOutDate },
    });
    return response.data;
};

// Create booking
export const createBooking = async (booking: Omit<Booking, 'Id' | 'Status'>): Promise<Booking> => {
    const response = await axiosInstance.post<Booking>('/bookings', booking);
    return response.data;
};

// Get all bookings (for owner)
export const getBookings = async (): Promise<Booking[]> => {
    const response = await axiosInstance.get<Booking[]>('/bookings');
    return response.data;
};

// Update booking status
export const updateBookingStatus = async (id: number, status: string): Promise<void> => {
    await axiosInstance.put(`/bookings/${id}/status`, { status });
};

// Confirm booking with deposit
export const confirmWithDeposit = async (id: number, depositAmount: number, referenceNumber: string): Promise<void> => {
    await axiosInstance.post(`/bookings/${id}/confirm-with-deposit`, { depositAmount, referenceNumber });
};

// Get deposits audit log (SuperAdmin only)
export const getDeposits = async (): Promise<any[]> => {
    const response = await axiosInstance.get('/bookings/deposits');
    return response.data;
};

// Search bookings by phone or ID
export const searchBookings = async (query: string): Promise<Booking[]> => {
    const response = await axiosInstance.get<Booking[]>('/bookings/search', {
        params: { query }
    });
    return response.data;
};
