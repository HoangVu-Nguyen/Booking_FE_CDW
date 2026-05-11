import { Component, input } from '@angular/core';
import { TourResponse } from '../../../../../../../../core/models/response/tour.response';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-homestay-tour',
  imports: [CurrencyPipe,CommonModule],
  templateUrl: './homestay-tour.html',
  styleUrl: './homestay-tour.css',
})
export class HomestayTour {
  tour = input.required<TourResponse>();

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
}
