import axiosInstance from './axios';

export interface EarningsSummary {
    TotalEarnings: number;
    UpcomingEarnings: number;
    CompletedEarnings: number;
    TotalCommission: number;
}

export interface EarningsDetails {
    BookingId: number;
    Date: string;
    ChaletName: string;
    Nights: number;
    TotalPrice: number;
    Commission: number;
    NetEarnings: number;
    Status: string;
}

export interface EarningsQueryParams {
    fromDate?: string;
    toDate?: string;
    chaletId?: number;
    status?: string;
}

export const getEarningsSummary = async (): Promise<EarningsSummary> => {
    const response = await axiosInstance.get<EarningsSummary>('/owner/earnings/summary');
    return response.data;
};

export const getEarningsDetails = async (params: EarningsQueryParams = {}): Promise<EarningsDetails[]> => {
    const response = await axiosInstance.get<EarningsDetails[]>('/owner/earnings', { params });
    return response.data;
};
