import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../../core/services/realtime/websocket.service';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { HostBookingItemResponse } from '../../../../core/models/response/booking.response';
import { BookingDetailModal } from '../booking-detail-modal/booking-detail-modal';
import { ToastService } from '../../../../core/services/toast/toast.service';
import {ConfirmationService} from "../../../../core/services/confirm/confirm.service";
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
    private bookingService: BookingService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
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


    this.confirmationService.confirm(
      'Xác nhận duyệt đơn',
      `Bạn có chắc chắn muốn duyệt đơn ${bookingCode}? Phòng sẽ được chốt và email xác nhận sẽ được gửi cho khách.`,
      () => {
      this.isLoading = true;
      this.bookingService.approveBooking(bookingCode).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toastService.success('Duyệt đơn thành công', `Đơn ${bookingCode} đã được duyệt và email đã gửi cho khách.`);
          this.loadBookingData();
          if (this.selectedBooking?.bookingCode === bookingCode) {
            this.closeBookingDetails();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error('Duyệt đơn thất bại', `Không thể duyệt đơn ${bookingCode} lúc này. Vui lòng thử lại sau.`);
        }
      });
    });
    
  }

  rejectBooking(bookingCode: string): void {
    const reason = prompt(`Nhập lý do từ chối đơn ${bookingCode} (hoặc để trống):`, "Chủ nhà không thể sắp xếp phòng");
    if (reason === null) return; 

    this.isLoading = true;
    this.bookingService.rejectBooking(bookingCode, reason).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toastService.success('Từ chối đơn thành công', `Đơn ${bookingCode} đã được từ chối và phòng đã được giải phóng.`);
          this.loadBookingData();
          if (this.selectedBooking?.bookingCode === bookingCode) {
            this.closeBookingDetails();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error('Từ chối đơn thất bại', `Không thể từ chối đơn ${bookingCode} lúc này. Vui lòng thử lại sau.`);
        }
    });
  }
}