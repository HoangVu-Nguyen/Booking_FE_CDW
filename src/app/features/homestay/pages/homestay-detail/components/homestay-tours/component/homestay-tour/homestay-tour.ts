import { Component, input, inject, computed } from '@angular/core';
import { TourResponse } from '../../../../../../../../core/models/response/tour.response';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { BookingService } from '../../../../../../../../core/services/booking/booking.service'; // Bác kiểm tra lại đường dẫn nhé

@Component({
  selector: 'app-homestay-tour',
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './homestay-tour.html',
  styleUrl: './homestay-tour.css',
})
export class HomestayTour {
  tour = input.required<TourResponse>();
  
  // Inject service quản lý đặt phòng
  protected bookingService = inject(BookingService);

  // Kiểm tra xem tour này đã được chọn chưa (Reactive theo Signal)
  isAdded = computed(() => 
    this.bookingService.currentTourSelections().some(t => t.id === this.tour().id)
  );

  get durationText(): string {
    const t = this.tour();
    switch (t.durationType) {
      case 'HOURS': return `${t.durationValue} giờ`;
      case 'HALF_DAY': return 'Nửa ngày';
      case 'FULL_DAY': return 'Cả ngày';
      case 'DAYS': return `${t.durationValue} ngày`;
      default: return '';
    }
  }

  // Hàm xử lý khi bấm nút
  toggleSelection() {
    this.bookingService.toggleTour(this.tour());
  }
}