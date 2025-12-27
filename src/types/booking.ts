import type { Chalet } from './chalet';

export interface Booking {
    Id: number;
    ChaletId: number;
    CheckInDate: string;
    CheckOutDate: string;
    UserPhoneNumber: string;
    Status: string;
    BookingReference?: string;
    TotalPrice?: number;
    DepositAmount?: number;
    Chalet?: Chalet;
    CreatedAt?: string;
    PlatformCommissionAmount?: number;
}
