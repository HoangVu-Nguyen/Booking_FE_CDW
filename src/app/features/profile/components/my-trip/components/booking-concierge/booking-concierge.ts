import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostInfo } from '../../../../../../core/models/response/trip-detail.response';

@Component({
  selector: 'app-booking-concierge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-concierge.html',
  styleUrl: './booking-concierge.css',
})
export class BookingConcierge {
  // Hứng dữ liệu host từ component cha
  @Input({ required: true }) host!: HostInfo;

  /**
   * Tính năng tự động mở app gọi điện trên điện thoại
   */
  public callHost(): void {
    if (this.host?.phoneNumber) {
      window.open(`tel:${this.host.phoneNumber}`, '_self');
    } else {
      console.warn('Quản gia chưa cập nhật số điện thoại.');
    }
  }

  /**
   * Xử lý tính năng nhắn tin (Mở modal chat hoặc chuyển hướng sang trang tin nhắn)
   */
  public sendMessage(): void {
    console.log(`Đang mở luồng chat với Host ID: ${this.host.id}`);
    // Sau này bác ráp Firebase hoặc Web Socket vào đây để mở khung chat nhé
  }
}