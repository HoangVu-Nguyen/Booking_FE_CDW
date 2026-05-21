export interface BookingInitResponse {
    bookingCode: string;
    bookingId: number;
}
export interface HostBookingItemResponse {
  bookingCode: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestAvatar: string;
  
  homestayName: string;
  roomName: string;
  
  adults: number;
  children: number;
  
  checkInDate: string; // Angular DatePipe sẽ tự lo việc format hiển thị
  checkOutDate: string;
  nights: number;
  
  source: string;
  totalPrice: number;
  paidAmount: number;
  
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}