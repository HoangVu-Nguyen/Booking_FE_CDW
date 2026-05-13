import { Component, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { BookingService } from '../../../../../../core/services/booking/booking.service';

@Component({
  selector: 'app-homestay-booking-widget',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './homestay-booking-widget.html',
  styleUrl: './homestay-booking-widget.css',
})
export class HomestayBookingWidget implements OnInit {
  private homestayService = inject(HomestayService);
  public bookingService = inject(BookingService);

  // 1. Dữ liệu Homestay
  homestay = computed(() => this.homestayService.currentHomestay());

  // 2. State Lịch trình & Số lượng (Từ Service)
  checkInDate = this.bookingService.checkInDate;
  checkOutDate = this.bookingService.checkOutDate;
  nights = this.bookingService.nights;
  guests = this.bookingService.searchGuests;

  // 3. State Chọn phòng (Từ Service)
  selectedRoom = this.bookingService.currentSelection;
  selectedPlan = this.bookingService.currentSelectedPlan;
  roomCount = this.bookingService.selectedRoomCount;

  // 4. Tính tiền (Giá x Số đêm x Số phòng)
  subtotal = computed(() => {
    const plan = this.selectedPlan();
    if (!plan || this.nights() === 0) return 0;
    return plan.price * this.nights() * this.roomCount();
  });

  serviceFee = computed(() => {
    return this.subtotal() * 0.1; // 10%
  });

  total = computed(() => {
    return this.subtotal() + this.serviceFee();
  });

  ngOnInit(): void {
    console.log(this.selectedRoom()?.name)
  }

  // Hàm xóa lựa chọn khi khách bấm nút "Change"
  clearSelection(): void {
    this.bookingService.clearSelection();
  }

  scrollToRooms(): void {
    const element = document.getElementById('room-selection-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onConfirmBooking(): void {
    if (this.selectedPlan() && this.selectedRoom()) {
      console.log('Đặt phòng:', this.selectedRoom()?.name, '-', this.selectedPlan()?.name);
      console.log('Số lượng:', this.roomCount(), 'phòng');
    }
  }
}