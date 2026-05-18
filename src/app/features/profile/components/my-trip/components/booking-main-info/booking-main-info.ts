import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripDetailResponse } from '../../../../../../core/models/response/trip-detail.response';

@Component({
  selector: 'app-booking-main-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-main-info.html',
  styleUrl: './booking-main-info.css',
})
export class BookingMainInfo {
  // Nhận dữ liệu chi tiết từ component cha (BookingDetailComponent)
  @Input({ required: true }) data!: TripDetailResponse;

  /**
   * Getter gom nhóm tên các không gian đã đặt.
   * Ví dụ: "Master Suite Villa (x1), Deluxe Room (x2)"
   */
  get roomNamesDisplay(): string {
    if (!this.data?.rooms || this.data.rooms.length === 0) {
      return 'Đang cập nhật không gian';
    }
    return this.data.rooms
      .map(room => `${room.roomName} (x${room.quantity})`)
      .join(', ');
  }

  /**
   * Getter lấy Icon thanh toán dựa theo phương thức
   * (Mở rộng thêm nếu sau này có Momo, VNPay...)
   */
  get paymentMethodBadge(): string {
    if (!this.data?.paymentMethod) return 'CHUYỂN KHOẢN';
    if (this.data.paymentMethod.toUpperCase().includes('VISA')) return 'VISA';
    if (this.data.paymentMethod.toUpperCase().includes('MASTER')) return 'MASTER';
    return 'THẺ/VÍ';
  }
}