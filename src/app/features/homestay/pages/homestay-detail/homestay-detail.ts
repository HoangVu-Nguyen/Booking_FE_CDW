import { Component, computed, effect, inject, OnChanges, OnDestroy, OnInit, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
// Components
import { HomestayHeader } from './components/homestay-header/homestay-header';
import { HomestayGallery } from './components/homestay-gallery/homestay-gallery';
import { HomestayAmenities } from './components/homestay-amenities/homestay-amenities';
import { HomestayLocation } from './components/homestay-location/homestay-location';
import { HomestayReviews } from './components/homestay-reviews/homestay-reviews';
import { HomestayBookingWidget } from './components/homestay-booking-widget/homestay-booking-widget';
import { HomestayTours } from './components/homestay-tours/homestay-tours';
import { RoomCard } from './components/room-card/room-card';

// Services
import { HomestayService } from '../../../../core/services/homestay/homestay.service';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { RoomService } from '../../../../core/services/room.service';
import { ChatStateService } from '../../../../core/services/chat/chat-state.service';

@Component({
  selector: 'app-homestay-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HomestayHeader,
    HomestayGallery,
    HomestayAmenities,
    HomestayLocation,
    HomestayReviews,
    HomestayBookingWidget,
    HomestayTours,
    RoomCard,
    MatMenuModule
  ],
  templateUrl: './homestay-detail.html',
  styleUrl: './homestay-detail.css',
})
export class HomestayDetail implements OnInit, OnChanges, OnDestroy {
  // 1. Kết nối trực tiếp State từ Services
  homestay = computed(() => this.homestayService.currentHomestay());


  // 2. Local State cho UI
  unavailableDates = signal<string[]>([]);

  // 3. Computed toán học (Dùng cho thông tin tóm tắt nếu cần)
  subtotal = computed(() => (this.homestay()?.basePrice || 0) * this.nights());
  serviceFee = computed(() => this.subtotal() * 0.1);
  total = computed(() => this.subtotal() + this.serviceFee());
  private homestayService = inject(HomestayService);
  private bookingService = inject(BookingService);
  private roomService = inject(RoomService);
  private route = inject(ActivatedRoute);
  private chatStateService = inject(ChatStateService);
  constructor() {
    // 2. KÉO LOGIC CHAT VÀO ĐÂY: Tự động chạy mỗi khi Signal homestay() nhận data từ API
    effect(() => {
      const current = this.homestay();
      if (current) {
        // Chạy hàm lịch
        this.loadUnavailableDates(current.id);

        // BƠM DATA VÀO WIDGET CHAT (Nhớ gọi hàm kiếu Signal là current.id hoặc current.name)
        this.chatStateService.autoTargetHost.set({
          id: current.owner.id,
          name: current.name,
          avatar: current.imageUrls && current.imageUrls.length > 0
            ? current.imageUrls[0]
            : 'assets/images/homestay-placeholder.jpg'
        });
        console.log(this.chatStateService.autoTargetHost())

        console.log('Đã cấu hình tự động chat với chủ nhà:', current.name);
      }
    }, { allowSignalWrites: true });
  }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }
  ngOnDestroy() {
    this.chatStateService.autoTargetHost.set(null);
  }
  checkInDate = this.bookingService.checkInDate;
  checkOutDate = this.bookingService.checkOutDate;
  nights = this.bookingService.nights;
  searchGuests = this.bookingService.searchGuests;
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.homestayService.getHomestayById(Number(id)).subscribe();
      }
    });
  }
  searchStartDate = computed(() => this.checkInDate());
  searchEndDate = computed(() => this.checkOutDate());

  // --- LOGIC XỬ LÝ LỊCH ---

  loadUnavailableDates(homestayId: number) {
    const today = new Date();
    this.roomService.getUnavailableDates(homestayId, today.getMonth() + 1, today.getFullYear())
      .subscribe({
        next: (dates: any[]) => {
          const formattedDates = dates.map(d => {
            // Xử lý nếu BE trả về mảng [Y, M, D] hoặc string
            return Array.isArray(d)
              ? `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`
              : d;
          });
          this.unavailableDates.set(formattedDates);
        }
      });
  }

  // Cung cấp filter cho MatDatePicker
  myDateFilter = (d: Date | null): boolean => this.filterLogic(d);

  onDateChange(type: 'start' | 'end', event: any) {
    if (type === 'start') {
      this.checkInDate.set(event.value);
      this.checkOutDate.set(null); // Reset ngày về khi chọn lại ngày đi
      this.bookingService.currentSelectedPlan.set(null); // Reset gói phòng
    } else {
      this.checkOutDate.set(event.value);
    }
    // Refresh filter để nhận diện vùng chặn mới
    this.myDateFilter = (d: Date | null): boolean => this.filterLogic(d);
  }

  private filterLogic(d: Date | null): boolean {
    const date = d || new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return false;

    const dateString = this.formatDate(date);
    const blockedDates = this.unavailableDates();
    const checkIn = this.checkInDate();

    // Nếu đã chọn ngày đi, không cho chọn ngày về trước ngày đi
    // Và không cho chọn ngày về vượt quá ngày đã bị đặt đầu tiên sau ngày đi
    if (checkIn && !this.checkOutDate()) {
      const checkInStr = this.formatDate(checkIn);
      if (dateString < checkInStr) return false;

      const nextBlockedDate = blockedDates.filter(b => b > checkInStr).sort()[0];
      if (nextBlockedDate && dateString > nextBlockedDate) return false;
    }

    return !blockedDates.includes(dateString);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('sv-SE'); // Trả về YYYY-MM-DD chuẩn nhất
  }

  // --- ACTIONS ---

  onConfirmBooking() {
    if (!this.checkInDate() || !this.checkOutDate()) {
      alert('Vui lòng chọn đầy đủ ngày lưu trú!');
      return;
    }
  }
  onCheckAvailability() {
    const id = this.homestay()?.id;
    const start = this.checkInDate();
    const end = this.checkOutDate();

    if (!id || !start || !end) return;

    // Chuyển đổi sang định dạng YYYY-MM-DD
    const startDateStr = this.formatDate(start);
    const endDateStr = this.formatDate(end);

    this.homestayService.getAvailableRooms(
      id,
      startDateStr,
      endDateStr,
      this.searchGuests()
    ).subscribe({
      next: (res) => {
        if (res.success) {
          console.log('Rooms updated successfully!');
          // Cuộn xuống danh sách phòng để khách chọn
          document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
        }
      },
      error: (err) => console.error('Failed to fetch rooms', err)
    });
  }


  // Hàm xử lý tăng giảm
  updateGuestCount(delta: number) {
    const currentVal = this.bookingService.searchGuests();
    const newVal = currentVal + delta;

    if (newVal >= 1 && newVal <= 10) {
      this.bookingService.searchGuests.set(newVal);
    }
  }

}
