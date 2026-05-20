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
 getBookingColor(status: string, roomId: number): string {
  // 1. Phân loại màu theo trạng thái đặc biệt
  if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border border-amber-300';
  if (status === 'CANCELLED') return 'bg-rose-50 text-rose-700 border border-rose-300';
  if (status === 'MAINTENANCE') return 'bg-neutral-100 text-neutral-500 border border-neutral-300 border-dashed';

  // 2. Trạng thái CONFIRMED -> Đổ màu Gradient theo từng phòng
  const confirmedColors = [
    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border border-indigo-600',
    'bg-gradient-to-r from-emerald-400 to-teal-500 text-white border border-teal-600',
    'bg-gradient-to-r from-violet-500 to-purple-500 text-white border border-purple-600',
    'bg-gradient-to-r from-orange-400 to-amber-500 text-white border border-amber-600',
    'bg-gradient-to-r from-pink-500 to-rose-500 text-white border border-rose-600',
    'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border border-cyan-600'
  ];
  
  // Dùng thuật toán Modulo để chia đều màu cho các phòng.
  // Ví dụ: roomId 1 sẽ lấy màu 1, roomId 7 quay lại lấy màu 1.
  return confirmedColors[(roomId || 0) % confirmedColors.length];
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
