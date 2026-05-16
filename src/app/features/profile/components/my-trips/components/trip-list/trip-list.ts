import { Component, computed, inject, input, Input } from '@angular/core';
import { TripCard } from "../trip-card/trip-card";
import { TripService } from '../../../../../../core/services/trip/trip.service';
@Component({
  selector: 'app-trip-list',
  imports: [TripCard],
  templateUrl: './trip-list.html',
  styleUrl: './trip-list.css',
})
export class TripList {
public status = input<string>('PENDING');
  // Danh sách các chuyến đi sau khi đã lọc để hiển thị ra HTML
  public tripService = inject(TripService);
  ngOnInit(): void {
    // Tự động gọi API kéo dữ liệu về kho lưu trữ nếu kho đang trống
    if (this.tripService.myTrips().length === 0) {
      this.tripService.fetchUserTrips();
    }
  }

  // Khai báo mảng hiển thị bằng computed() ăn theo Signal tổng
  public displayTrips = computed(() => {
    return this.tripService.myTrips().filter(trip => trip.status === this.status());
  });
}
