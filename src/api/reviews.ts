import api from './axios';
import type { Review, CreateReviewData, UpdateReviewStatusData } from '../types/review';

export const getChaletReviews = async (chaletId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/Reviews/chalet/${chaletId}`);
    return response.data;
};

export const addReview = async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post<Review>('/Reviews', data);
    return response.data;
};

export const getPendingReviews = async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/Reviews/pending');
    return response.data;
};

export const updateReviewStatus = async (reviewId: number, data: UpdateReviewStatusData): Promise<Review> => {
    const response = await api.put<Review>(`/Reviews/${reviewId}/status`, data);
    return response.data;
};
