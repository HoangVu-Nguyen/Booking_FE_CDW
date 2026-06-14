import { Component, computed, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { BookingService } from '../../../../../../core/services/booking/booking.service';
import { Router } from '@angular/router';
import { RoomResponse } from '../../../../../../core/models/response/room.response';
import { LightboxImage } from '../../../../../../core/models/image/image.model';
import { SharedImageLightbox } from '../../../../../../shared/components/shared-image-lightbox/shared-image-lightbox';
@Component({
  selector: 'app-homestay-booking-widget',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatNativeDateModule, SharedImageLightbox],
  templateUrl: './homestay-booking-widget.html',
  styleUrl: './homestay-booking-widget.css',
})
export class HomestayBookingWidget implements OnInit {
  private homestayService = inject(HomestayService);
  public bookingService = inject(BookingService);
  private router = inject(Router);

  // 1. Dữ liệu Homestay (Signal-based)
  homestay = computed(() => this.homestayService.currentHomestay());
  @ViewChild('lightbox') lightbox!: SharedImageLightbox;

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

  // ----------------------------------------------------
  // 4. LOGIC TÍNH TOÁN (Đồng bộ logic với Backend)
  // ----------------------------------------------------

  // Tiền phòng = Giá gói * Số đêm * Số phòng
  roomSubtotal = computed(() => {
    const plan = this.selectedPlan();
    const nightCount = this.nights();
    if (!plan || nightCount <= 0) return 0;
    return plan.price * nightCount * this.roomCount();
  });

  // Tiền tour = Tổng các (Giá tour/người * Tổng số khách) của từng tour trong mảng
  tourSubtotal = computed(() => {
    const tours = this.selectedTours();
    const numGuests = this.guests();
    if (!tours || tours.length === 0) return 0;

    // Tính tổng tích lũy của tất cả tour khách đã chọn
    return tours.reduce((sum, tour) => sum + ((tour.pricePerPerson || 0) * numGuests), 0);
  });

  // Thuế & Phí dịch vụ (Tính 10% trên tổng giá trị - khớp với Backend)
  serviceFee = computed(() => {
    const baseTotal = this.roomSubtotal() + this.tourSubtotal();
    return baseTotal * 0.1;
  });

  // Tổng thanh toán cuối cùng
  total = computed(() => {
    return this.roomSubtotal() + this.tourSubtotal() + this.serviceFee();
  });

  ngOnInit(): void { }

  // ----------------------------------------------------
  // 5. ACTIONS
  // ----------------------------------------------------

  clearSelection(): void {
    this.bookingService.clearSelection();
  }

  removeTour(tourId: number): void {
    const tours = this.selectedTours();
    const tour = tours.find(t => t.id === tourId);
    if (tour) this.bookingService.toggleTour(tour);
  }

  scrollToRooms(): void {
    document.getElementById('room-selection-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onConfirmBooking(): void {
    const currentHomestay = this.homestay();
    const room = this.selectedRoom();
    const plan = this.selectedPlan();
    const checkIn = this.checkInDate();
    const checkOut = this.checkOutDate();

    // Validate cứng trước khi gọi API
    if (!currentHomestay || !room || !plan || !checkIn || !checkOut) {
      alert('Vui lòng hoàn tất chọn phòng và ngày lưu trú!');
      return;
    }

    // Helper: Định dạng Date sang string ISO "YYYY-MM-DD" gửi cho Java
    const formatDateISO = (date: Date): string => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // MAP DANH SÁCH TOURS THEO FORMAT LIST<TOURBOOKINGITEM> CỦA BÁC VŨ
    const toursPayload = this.selectedTours().map(t => ({
      tourId: t.id,
      // Bác nhớ đảm bảo object tour trong service có trường availabilityId nhé
      availabilityId: (t as any).availabilityId || 1,
      tourDate: formatDateISO(checkIn), // Mặc định lấy ngày check-in, bác có thể đổi tùy UI
      participantCount: this.guests()
    }));

    // PAYLOAD CUỐI CÙNG (KHÍT VỚI BOOKINGINITREQUEST TRONG JAVA)
    const payload = {
      homestayId: currentHomestay.id,
      roomId: room.id,
      ratePlanId: plan.id,
      checkInDate: formatDateISO(checkIn),
      checkOutDate: formatDateISO(checkOut),
      roomQuantity: this.roomCount(),
      guestCount: this.guests(),

      // Gửi danh sách Tour (Dù rỗng hay có thì Backend cũng nhận được List)
      tours: toursPayload,

      // Các thông tin liên hệ (Lấy từ User profile hoặc cho khách nhập)
      guestName: null,
      email: null,
      phone: null,
      specialRequests: null
    };

    console.log('🚀 Payload gửi đi cho Clyvasync:', payload);

    this.bookingService.initBooking(payload).subscribe({
      next: (response) => {
        // Response format bác trả về: { success: boolean, data: { bookingCode, id } }
        if (response.data?.bookingCode) {
          console.log('✅ Đã khóa phòng thành công:', response.data.bookingCode);

          // Điều hướng sang trang thanh toán kèm theo mã code
          this.router.navigate(['/checkout', response.data.bookingCode]);
        }
      },
      error: (err) => {
        // Xử lý các lỗi nghiệp vụ bắn ra từ Backend (400, 409...)
        const errorMsg = err.error?.message || 'Hệ thống bận, không thể giữ chỗ vào lúc này!';
        console.error('❌ Lỗi đặt phòng:', err);
        alert(errorMsg);
      }
    });
  }
  getCoverImage(room: RoomResponse): string {
    if (!room.images || room.images.length === 0) {
      return 'assets/images/default-room.jpg'; // Ảnh dự phòng
    }
    const cover = room.images.find(img => img.isCover);
    return cover ? cover.url : room.images[0].url;
  }
  openRoomGallery(room: RoomResponse) {
    if (!room.images || room.images.length === 0) return;

    const lightboxData: LightboxImage[] = room.images.map(img => ({
      url: img.url,
      isCover: img.isCover,
      caption: `Ảnh ${room.name}`
    }));

    this.lightbox.open(lightboxData, 0);
  }
}