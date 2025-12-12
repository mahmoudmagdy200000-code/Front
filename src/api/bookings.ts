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

// Get bookings by phone number
export const getBookingByPhone = async (phoneNumber: string): Promise<Booking[]> => {
    const response = await axiosInstance.get<Booking[]>('/bookings/search', {
        params: { phoneNumber }
    });
    return response.data;
};
