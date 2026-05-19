import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-homestay-item',
  imports: [CommonModule],
  templateUrl: './homestay-item.html',
  styleUrl: './homestay-item.css',
})
export class HomestayItem {
  @Input() home: any;
  @Input() timeline: any;
  @Output() weekChanged = new EventEmitter<number>();
  // Chuyển mảng [2026, 5, 17] thành ngày chuẩn
  parseArrayToDate(dateArray: number[]): Date {
    if (!dateArray || dateArray.length < 3) return new Date();
    // Tháng trong JS bắt đầu từ 0 (tháng 5 là 4)
    return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
  }

  calculateBookingPosition(booking: any) {
  const startDate = this.parseArrayToDate(booking.checkInDate).getTime();
  const endDate = this.parseArrayToDate(booking.checkOutDate).getTime();
  
  // DÙNG BIẾN INPUT startDate ĐỂ LÀM MỐC (Không dùng new Date() cứng nữa)
  const tableStart = this.startDate.getTime(); 
  const oneDay = 24 * 60 * 60 * 1000;

  const leftDays = (startDate - tableStart) / oneDay;
  const durationDays = (endDate - startDate) / oneDay;

  const left = leftDays * 14.28;
  const width = durationDays * 14.28;

  return {
    'left.%': left,
    'width.%': width > 0 ? width : 14.28,
    'display': (left + width) < 0 || left > 100 ? 'none' : 'block'
  };
}
  getBookingStyle(booking: any) {
    const position = this.calculateBookingPosition(booking);

    // Màu sắc theo trạng thái
    const colors = {
      'CONFIRMED': 'bg-neutral-900',
      'PENDING': 'bg-amber-500',
      'CANCELLED': 'bg-rose-500',
      'MAINTENANCE': 'bg-blue-500'
    };

    const colorClass = colors[booking.status as keyof typeof colors] || 'bg-neutral-500';

    return {
      ...position,
      'class': colorClass // Trả về class màu
    };
  }
  getBookingColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-neutral-900';
      case 'PENDING': return 'bg-amber-500';
      case 'CANCELLED': return 'bg-rose-500';
      default: return 'bg-emerald-600';
    }
  }
  @Input() startDate: Date = new Date(2026, 4, 18); // Nhận ngày từ cha
  weekDays: string[] = [];

  ngOnChanges() {
    this.updateWeekDays();
  }

  updateWeekDays() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.startDate);
      d.setDate(d.getDate() + i);
      this.weekDays.push(`${days[d.getDay()]} ${d.getDate()}`);
    }
  }
}
