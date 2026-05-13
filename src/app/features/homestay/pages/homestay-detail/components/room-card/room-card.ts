import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { RoomResponse } from '../../../../../../core/models/response/room.response';
import { BookingService } from '../../../../../../core/services/booking/booking.service';
@Component({
  selector: 'app-room-card',
  imports: [CommonModule],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css',
})
export class RoomCard {
  constructor(private bookingService:BookingService){

  }
room = input.required<RoomResponse>();
  nights = input.required<number>();
  select = output<any>();

  // Signal quản lý đóng mở bảng giá
  isExpanded = signal(false);

  toggleRates() {
    this.isExpanded.update(v => !v);
  }

  onSelect(plan: any) {
    this.select.emit({ room: this.room(), plan: plan });
  }

  // Hàm tính giá thấp nhất để hiện ở chế độ thu gọn
  getMinPrice() {
    const plans = this.room().ratePlans || [];
    if (plans.length === 0) return 0;
    return Math.min(...plans.map((p: any) => p.price));
  }
  onSelectRoom(room:RoomResponse,plan: any,count:number) {
  // Bắn data lên Service để Widget nhận được
  this.bookingService.selectPlan(room,plan,count);
  

}
}
