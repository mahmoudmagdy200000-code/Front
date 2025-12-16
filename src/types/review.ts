export interface Review {
    Id: number;
    ChaletId: number;
    Rating: number;
    Comment?: string;
    ReviewerName?: string;
    Status: 'Pending' | 'Approved' | 'Rejected';
    CreatedAt: string;
}

export interface CreateReviewData {
    ChaletId: number;
    Rating: number;
    Comment?: string;
    ReviewerName?: string;
}

export interface UpdateReviewStatusData {
    Status: 'Pending' | 'Approved' | 'Rejected';
}
