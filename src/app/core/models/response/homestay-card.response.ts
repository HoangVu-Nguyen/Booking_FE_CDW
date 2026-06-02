import { HomestayStatus } from "../../enum/homestay-status";

export interface HomestayCardResponse {
  id: number;
  name: string;
  cityName: string;
  basePrice: number;
  status: HomestayStatus | string; // Giữ string để fallback nếu chưa map kịp enum ở FE
  imageUrls: string[];            // Mảng URL ảnh phục vụ tính năng hover đổi ảnh crossfade
  averageRating: number;
  isFavorite: boolean;            // Luôn là true khi lấy từ API /my-collection
}
// Định nghĩa chi tiết Tour đi kèm
export interface TourInfo {
  tourName: string;
  tourDate: string;
  price: number; // BigDecimal trong Java chuyển thành number trong TS
}

// Định nghĩa Context của Booking (Gộp Homestay + Tour)
export interface BookingContextInfo {
  bookingCode: string;
  homestayName: string;
  status: string; // Nếu thích chặt chẽ, bạn có thể đổi thành: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN'
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookedTours: TourInfo[];
}

// Response tổng trả về khi khởi tạo phòng chat
export interface ChatInitResponse {
  conversationId: number;
  name: string;
  avatar: string;
  booking: BookingContextInfo | null; // Có thể null nếu user chưa có giao dịch nào với host
}