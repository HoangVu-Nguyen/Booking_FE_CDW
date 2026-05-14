export interface BookingInitRequest {
    homestayId: number;
    roomId: number;
    ratePlanId: number;
    checkInDate: string;  // Định dạng YYYY-MM-DD
    checkOutDate: string; // Định dạng YYYY-MM-DD
    roomQuantity: number;
    guestCount: number;
    
    // Tour đính kèm (Có thể null)
    tourId?: number | null;
    availabilityId?: number | null;
    tourDate?: string | null;
    participantCount?: number | null;
}

