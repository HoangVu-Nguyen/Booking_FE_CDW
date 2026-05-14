export enum BookingStatus {
    DRAFT,            // Khách mới vào trang checkout, đang nhập thông tin
    PENDING_PAYMENT,  // Đã nhấn thanh toán, đang chờ Gateway (VNPAY/MoMo) phản hồi
    CONFIRMED,        // Thanh toán thành công
    CANCELLED,        // Khách hủy hoặc hết hạn thanh toán (timeout)
    FAILED            // Lỗi thanh toán từ phía ngân hàng
}