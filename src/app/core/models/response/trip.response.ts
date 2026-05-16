/**
 * 1. DTO con: Đại diện cho từng Tour trải nghiệm đính kèm trong chuyến đi
 */
export interface TripTourResponse {
    tourId: string;
    tourName: string;
    tourImage: string;
    participants: number; // Số người tham gia (participant_count từ DB)
    tourDate: string;     // Ngày đi tour (Dạng chuỗi "yyyy-MM-dd" từ LocalDate)
    startTime: string;    // Giờ khởi hành "HH:mm:ss" (Từ tour_availability)
    endTime: string;      // Giờ kết thúc "HH:mm:ss" (Đã được Java cộng duration)
}

/**
 * 2. DTO tổng (Cha): Đại diện cho toàn bộ dữ liệu của một Trip Card
 */
export interface TripResponse {
    bookingCode: string;     // Mã đặt phòng: TT-8924-DAL
    propertyName: string;    // Tên Homestay: The Glass House Pine
    location: string;        // Địa chỉ chi tiết homestay
    propertyImage: string;   // Ảnh cover (Đã được gỡ lỗi NullPointerException từ BE)
    
    // Thời gian ở (Dạng chuỗi "yyyy-MM-dd" từ LocalDate của DB)
    checkIn: string;         
    checkOut: string;
    
    totalGuests: number;     // Tổng số khách (Tính tổng guest_count từ các room_detail)
    totalPrice: number;      // Tổng số tiền thanh toán (BigDecimal từ Java sang number)
    
    // Trạng thái để Angular phân loại chia Tab dữ liệu
    status: 'PENDING' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
    
    // Mảng các tour đính kèm (Nếu không có, BE sẽ trả về mảng rỗng [])
    tours: TripTourResponse[];
}