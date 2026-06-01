import { ChatContext } from "../../services/chat/chat-state.service";

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
  
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'| 'DRAFT' | 'AWAITING_PAYMENT';
  includedTours?: MiniTourInfor[];
  approved?: boolean; // Thêm trường này để đánh dấu đã từng được duyệt hay chưa
}
export interface MiniTourInfor {
  name: string;
  image: string;
  pricePerPerson: number;
  count: number;
  startDate: string;
  startTime: string;
}
export interface Conversation {
  id: number;
  type: ChatContext;
  name: string;
  avatar: string;
  lastMessage?: string;
  unreadCount: number;
  // THÊM THÔNG TIN BOOKING (Nếu có)
  booking?: {
    code: string;
    propertyName: string;
    image: string;
    status: string; // VD: 'Sắp nhận phòng', 'Đang lưu trú'
    dates?: string; // THÊM MỚI (Ví dụ: '28/05 - 30/05')
    price?: string;
  };
}