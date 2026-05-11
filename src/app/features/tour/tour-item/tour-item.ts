import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { TourResponse } from '../../../core/models/response/tour.response';

@Component({
  selector: 'app-tour-item',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  templateUrl: './tour-item.html',
  // QUAN TRỌNG: Gán class trực tiếp vào thẻ host <app-tour-item> để không làm vỡ Grid
  host: {
    '[class]': 'hostClasses()'
  }
})
export class TourItem {
  tour = input.required<TourResponse>();
  index = input.required<number>();

  // Dịch chính xác 100% các class từ HTML gốc của bạn
  hostClasses = computed(() => {
    const i = this.index() % 10;
    if (i === 0) return 'md:col-span-8 group block';
    if (i === 1) return 'md:col-span-4 self-center group block';
    if (i === 3) return 'md:col-span-4 group mt-12 block';
    if (i === 5 || i === 6) return 'md:col-span-6 group block';
    if (i === 8) return 'md:col-span-4 group mt-24 block';
    return 'md:col-span-4 group block'; // Cho các item 3, 5, 8, 10
  });
}