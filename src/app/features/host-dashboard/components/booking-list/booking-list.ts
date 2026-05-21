import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../../core/services/realtime/websocket.service';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { HostBookingItemResponse } from '../../../../core/models/response/booking.response';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe], // Nạp các Module cốt lõi
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css',
})
export class BookingList implements OnInit, OnDestroy {

  // 2. BIẾN TRẠNG THÁI GIAO DIỆN
  bookingList: HostBookingItemResponse[] = [];
  totalBookings: number = 0;
  isLoading: boolean = false;
  searchText: string = '';

  private bookingSocketSub!: Subscription;

  constructor(
    // private bookingService: BookingService, // Dùng để gọi API REST
    private websocketService: WebsocketService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.loadBookingData();
    this.initRealtimeListener();
  }



  loadBookingData(): void {
    this.isLoading = true;

    // GỌI THẲNG API BE VỪA VIẾT
    this.bookingService.getHostBookings().subscribe({
      next: (res) => {
        this.bookingList = res.data; // Đổ cái ụp dữ liệu thật vào đây
        console.log('Danh sách booking đã tải:', this.bookingList);
        this.totalBookings = res.data.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
    this.cdr.detectChanges(); // Báo Angular render lại bảng
  }



  // 4. HÀM LẮNG NGHE REALTIME WEBSOCKET (Đã bọc NgZone an toàn)
  private initRealtimeListener(): void {
    this.bookingSocketSub = this.websocketService.listenBookingStatus().subscribe({
      next: (notification) => {
        // Bắt buộc đẩy vào NgZone để không bị đóng băng UI khi có luồng chạy ngầm
        this.zone.run(() => {
          console.log('🔔 [REALTIME] BẮT ĐƯỢC ĐƠN HÀNG MỚI:', notification);

          // Khách thanh toán xong -> Tải lại danh sách
          this.loadBookingData();

          // Bắn chuông thông báo (Toastr/Alert)
          setTimeout(() => {
            alert(notification.message || `Đơn hàng ${notification.bookingCode} vừa được thanh toán thành công!`);
          }, 150);
        });
      },
      error: (err) => console.error('Lỗi socket tại BookingList:', err)
    });
  }

  // 5. HÀM XỬ LÝ SỰ KIỆN NÚT BẤM (Ví dụ)
  approveBooking(bookingCode: string): void {
    if (confirm(`Bạn có chắc muốn duyệt đơn ${bookingCode} không?`)) {
      // Gọi API duyệt đơn ở đây
      console.log('Đang duyệt đơn:', bookingCode);
    }
  }

  ngOnDestroy(): void {
    // Dọn dẹp bộ nhớ an toàn
    if (this.bookingSocketSub) {
      this.bookingSocketSub.unsubscribe();
    }
  }
}