export interface ReviewCreateRequest {
    bookingCode: string;
    rating: number;
    content: string;
    imageKeys: string[];
}
