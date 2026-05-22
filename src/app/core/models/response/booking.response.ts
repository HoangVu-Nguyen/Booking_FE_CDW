export interface BookingInitResponse {
    bookingCode: string;
    bookingId: number;
    isInstantBook:boolean;
}
export interface HostBookingItemResponse {
  bookingCode: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestAvatar: string;
  
  homestayName: string;
  roomName: string;
  roomImage: string;
  
  adults: number;
  children: number;
  
  checkInDate: string; // Angular DatePipe sẽ tự lo việc format hiển thị
  checkOutDate: string;
  nights: number;
  
  source: string;
  totalPrice: number;
  paidAmount: number;
  
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'| 'DRAFT';
  includedTours?: MiniTourInfor[];
}
export interface MiniTourInfor {
  name: string;
  image: string;
  count: number;
}