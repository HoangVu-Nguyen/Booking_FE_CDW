import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripService } from '../../../../../../core/services/trip/trip.service';

@Component({
  selector: 'app-past-trip-list',

  imports: [CommonModule, RouterModule],
  templateUrl: './past-trip-list.html',
  styleUrl: './past-trip-list.css' // Để trống hoặc tạo file css rỗng
})
export class PastTripList implements OnInit {
  // Inject Service xử lý dữ liệu động chống nghẽn mạch DB từ Backend nảy lên
  public tripService = inject(TripService);

  ngOnInit(): void {
    // Kích nổ API kéo mớ danh sách Dấu ấn hành trình thật về Signal
    this.tripService.fetchPastTrips();
  }
}