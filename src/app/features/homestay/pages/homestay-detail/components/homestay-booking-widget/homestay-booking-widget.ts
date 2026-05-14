import { Component, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { BookingService } from '../../../../../../core/services/booking/booking.service';
import { Router } from '@angular/router';

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

  // 2. State Lịch trình & Số lượng
  checkInDate = this.bookingService.checkInDate;
  checkOutDate = this.bookingService.checkOutDate;
  nights = this.bookingService.nights;
  guests = this.bookingService.searchGuests;

  // 3. State Chọn phòng & Tour
  selectedRoom = this.bookingService.currentSelection;
  selectedPlan = this.bookingService.currentSelectedPlan;
  roomCount = this.bookingService.selectedRoomCount;
  selectedTours = this.bookingService.currentTourSelections;
  private router = inject(Router);

  // ----------------------------------------------------
  // 4. LOGIC TÍNH TOÁN CHÍNH XÁC (BILLING COMPUTATIONS)
  // ----------------------------------------------------

  // Tiền phòng = Giá gói * Số đêm * Số phòng
  roomSubtotal = computed(() => {
    const plan = this.selectedPlan();
    if (!plan || this.nights() === 0) return 0;
    return plan.price * this.nights() * this.roomCount();
  });

  // Tiền tour = Tổng các (Giá tour/người * Tổng số khách)
  tourSubtotal = computed(() => {
    const tours = this.selectedTours();
    const numGuests = this.guests();
    if (!tours || tours.length === 0) return 0;
    
    return tours.reduce((sum, tour) => sum + ((tour.pricePerPerson || 0) * numGuests), 0);
  });

  // Phí dịch vụ (Tính 10% dựa trên tiền phòng)
  serviceFee = computed(() => {
    return this.roomSubtotal() * 0.1; 
  });

  // Tổng thanh toán cuối cùng = Phòng + Tour + Phí dịch vụ
  total = computed(() => {
    return this.roomSubtotal() + this.tourSubtotal() + this.serviceFee();
  });

  ngOnInit(): void {}

  // ----------------------------------------------------
  // 5. CÁC HÀM XỬ LÝ SỰ KIỆN TƯƠNG TÁC (ACTIONS)
  // ----------------------------------------------------

  // Hủy chọn gói phòng hiện tại
  clearSelection(): void {
    this.bookingService.clearSelection();
  }

  // Xóa riêng 1 tour cụ thể ra khỏi giỏ hàng
  removeTour(tourId: number): void {
    const tour = this.selectedTours().find(t => t.id === tourId);
    if(tour) this.bookingService.toggleTour(tour);
  }

  // Cuộn trang xuống phần danh sách phòng
  scrollToRooms(): void {
    const element = document.getElementById('room-selection-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Xác nhận đặt phòng (Test log)
  onConfirmBooking(): void {
    const currentHomestay = this.homestay();
    const room = this.selectedRoom();
    const plan = this.selectedPlan();

    if (currentHomestay && room && plan && this.checkInDate() && this.checkOutDate()) {
      
      // Hàm helper biến Date nội bộ thành chuỗi YYYY-MM-DD gửi cho Java
      const formatDateISO = (date: Date): string => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Giỏ hàng tour hiện tại (Backend thô đang nhận 1 tour đơn lẻ nên ta lấy phần tử đầu tiên nếu có)
      const tours = this.selectedTours();
      const hasTour = tours.length > 0;

      // Gom toàn bộ data thô từ các Signal để tạo Payload
      const payload: any = {
        homestayId: currentHomestay.id,
        roomId: room.id,
        ratePlanId: plan.id,
        checkInDate: formatDateISO(this.checkInDate()!),
        checkOutDate: formatDateISO(this.checkOutDate()!),
        roomQuantity: this.roomCount(),
        guestCount: this.guests(),
        
        // Đoạn này map dữ liệu Tour nếu khách chọn đặt kèm
        tourId: hasTour ? tours[0].id : null,
        availabilityId: hasTour ? (tours[0] as any).availabilityId || 1 : null, // Thêm trường thực tế của bác vào đây
        tourDate: hasTour ? formatDateISO(this.checkInDate()!) : null,        // Tạm lấy ngày check-in làm ngày đi tour
        participantCount: hasTour ? this.guests() : null
      };

      console.log('Bắt đầu khởi tạo đơn nháp lên DB với payload:', payload);

      // Gọi API sang Backend
      this.bookingService.initBooking(payload).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            console.log('Lưu DRAFT thành công, nhận mã:', response.data.bookingCode);
            
            // Điều hướng thẳng sang trang checkout cầm theo mã Code duy nhất
            // Route mong đợi: /checkout/BK-XXXX
            this.router.navigate(['/checkout', response.data.bookingCode]);
          } else {
            alert('Khởi tạo đơn đặt phòng thất bại, vui lòng kiểm tra lại!');
          }
        },
        error: (err) => {
          console.error('Lỗi kết nối với API /bookings/init:', err);
          alert('Hệ thống bận, không thể giữ chỗ vào lúc này!');
        }
      });
    }
  }

}