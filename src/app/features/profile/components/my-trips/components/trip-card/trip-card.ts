import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripResponse } from '../../../../../../core/models/response/trip.response';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css',
})
export class TripCard {
  // Cổng hứng dữ liệu bắt buộc từ Component Cha (trip-list) ném vào
  @Input({ required: true }) data!: TripResponse;

  /**
   * Tính toán số ngày còn lại động (UX Countdown)
   */
  get daysRemaining(): number {
    if (!this.data || !this.data.checkIn) return 0;
    const checkInDate = new Date(this.data.checkIn);
    const today = new Date();
    
    // Reset giờ về 00:00:00 để trừ ngày chuẩn xác
    checkInDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = checkInDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  public formatTime(time: any): string {
    if (!time) return '';
    
    // Nếu Backend trả về dạng mảng số [8, 0] do Jackson băm ra
    if (Array.isArray(time) && time.length >= 2) {
      const hour = time[0].toString().padStart(2, '0');
      const minute = time[1].toString().padStart(2, '0');
      return `${hour}:${minute}`;
    }
    
    // Nếu nó là chuỗi "08:00:00" sẵn thì chỉ cắt lấy "08:00"
    if (typeof time === 'string') {
      return time.substring(0, 5);
    }
    
    return time;
  }
}