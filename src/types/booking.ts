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
    Chalet?: Chalet;
}
