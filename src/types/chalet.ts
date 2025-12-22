export interface ChaletImage {
    Id: number;
    ChaletId: number;
    ImageUrl: string;
    IsPrimary: boolean;
    DisplayOrder: number;
}

export interface Chalet {
    Id: number;
    TitleEn: string;
    TitleAr: string;
    DescriptionEn: string;
    DescriptionAr: string;
    PricePerNight: number;
    AdultsCapacity: number;
    ChildrenCapacity: number;
    OwnerId: string;
    ImageUrl?: string;
    Images?: ChaletImage[];
    IsFeatured?: boolean;
    MonthlyEarnings?: number;
    UpcomingBookingsCount?: number;
}

export interface PagedResult<T> {
    Items: T[];
    TotalCount: number;
    PageNumber: number;
    PageSize: number;
    TotalPages: number;
    HasPreviousPage: boolean;
    HasNextPage: boolean;
}
