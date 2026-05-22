import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../../core/services/realtime/websocket.service';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { HostBookingItemResponse } from '../../../../core/models/response/booking.response';
import { BookingDetailModal } from '../booking-detail-modal/booking-detail-modal';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, BookingDetailModal],
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css',
})
export class BookingList implements OnInit, OnDestroy {

  bookingList: HostBookingItemResponse[] = [];
  totalBookings: number = 0;
  isLoading: boolean = false;
  searchText: string = '';
  
  public expandedBookingCode: string | null = null;
  public isViewModalOpen: boolean = false;
  public selectedBooking: HostBookingItemResponse | null = null;
  private bookingSocketSub!: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.loadBookingData();
    this.initRealtimeListener();
  }
getStatusLabel(status: string): string {
    const map: any = { 'DRAFT': 'Giữ chỗ', 'PENDING': 'Chờ duyệt', 'AWAITING_PAYMENT': 'Chờ thanh toán', 'CONFIRMED': 'Đã chốt', 'CANCELLED': 'Đã hủy' };
    return map[status] || status;
  }

  getRowStatusClass(status: string): string {
    const map: any = {
      'PENDING': 'bg-amber-50/30 border-amber-100/50',
      'AWAITING_PAYMENT': 'bg-sky-50/30 border-sky-100/50',
      'DRAFT': 'bg-stone-50/30 opacity-80',
      'CONFIRMED': 'hover:bg-stone-50/50',
      'CANCELLED': 'bg-rose-50/10 opacity-60 grayscale-[40%]'
    };
    return map[status] || '';
  }
  loadBookingData(): void {
    this.isLoading = true;
    this.bookingService.getHostBookings().subscribe({
      next: (res) => {
        this.bookingList = res.data;
         console.log('Dữ liệu đơn hàng đã tải:', this.bookingList);
        this.totalBookings = res.data.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  private initRealtimeListener(): void {
    this.bookingSocketSub = this.websocketService.listenBookingStatus().subscribe({
      next: (notification) => {
        this.zone.run(() => {
          this.loadBookingData();
        });
      },
      error: (err) => console.error('Lỗi socket:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.bookingSocketSub) {
      this.bookingSocketSub.unsubscribe();
    }
  }

  toggleExpandRow(code: string): void {
    if (this.expandedBookingCode === code) {
      this.expandedBookingCode = null;
    } else {
      this.expandedBookingCode = code;
    }
  }

  openBookingDetails(booking: HostBookingItemResponse): void {
    this.selectedBooking = booking;
    this.isViewModalOpen = true;
  }

  closeBookingDetails(): void {
    this.isViewModalOpen = false;
    setTimeout(() => {
      this.selectedBooking = null;
    }, 300);
  }

  // --- API ACTIONS ---
  approveBooking(bookingCode: string): void {
    if (confirm(`Bạn có chắc chắn muốn duyệt đơn hàng ${bookingCode}? Hệ thống sẽ gửi email thanh toán cho khách.`)) {
      this.isLoading = true;
      this.bookingService.approveBooking(bookingCode).subscribe({
        next: (res) => {
          this.isLoading = false;
          alert(res.message || 'Đã duyệt đơn và gửi email cho khách thành công!');
          this.loadBookingData();
          if (this.selectedBooking?.bookingCode === bookingCode) {
            this.closeBookingDetails();
          }
        },
        error: (err) => {
          this.isLoading = false;
          alert('Không thể duyệt đơn lúc này. Vui lòng thử lại!');
        }
      });
    }
  }

  rejectBooking(bookingCode: string): void {
    const reason = prompt(`Nhập lý do từ chối đơn ${bookingCode} (hoặc để trống):`, "Chủ nhà không thể sắp xếp phòng");
    if (reason === null) return; 

    this.isLoading = true;
    this.bookingService.rejectBooking(bookingCode, reason).subscribe({
        next: (res) => {
          this.isLoading = false;
          alert(res.message || 'Đã từ chối đơn và giải phóng phòng thành công!');
          this.loadBookingData();
          if (this.selectedBooking?.bookingCode === bookingCode) {
            this.closeBookingDetails();
          }
        },
        error: (err) => {
          this.isLoading = false;
          alert('Không thể từ chối đơn lúc này!');
        }
    });
  }
}