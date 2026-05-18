export interface PastTripResponse {
  bookingId: number;
  bookingCode: string;
  homestayName: string;
  primaryImageUrl: string;
  locationName: string;
  completedMonthYear: string; // Trả về dạng: "Tháng 10, 2025"
  averageRating: number;
  tripReviewStatus: 'EXCELLENT' | 'GOOD'; 
}