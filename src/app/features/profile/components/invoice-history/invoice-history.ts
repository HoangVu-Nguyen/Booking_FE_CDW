import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceRecord } from '../../../../core/models/trip/invoice.model';
import { TripResponse } from '../../../../core/models/response/trip.response';
import { TripService } from '../../../../core/services/trip/trip.service';

@Component({
  selector: 'app-invoice-history',
  standalone: true, // Nhớ thêm cái này nếu là Standalone component
  imports: [DecimalPipe, DatePipe, CommonModule, FormsModule],
  templateUrl: './invoice-history.html',
  styleUrl: './invoice-history.css',
})
export class InvoiceHistory implements OnInit {
  private tripService = inject(TripService);

  // Các State tìm kiếm và lọc
  searchQuery = signal('');
  filterType = signal('ALL');

  // Hạn mức thẻ/thành viên của khách (Mock 200 củ)
  readonly SPENDING_LIMIT = 200000000; 

  // --- CƠ CHẾ MAPPING TỰ ĐỘNG BẰNG COMPUTED ---
  // Invoices sẽ tự động cập nhật và biến đổi dữ liệu mỗi khi tripService.myTrips() có data mới
  invoices = computed<InvoiceRecord[]>(() => {
    // Đọc data từ Service (Hãy chắc chắn bên TripService ông đã có biến myTrips)
    const trips = this.tripService.myTrips();

    if (!trips || trips.length === 0) return [];

    return trips.map(trip => {
      // 1. Phân loại hình thức dựa trên mảng tours
      const recordType = (trip.tours && trip.tours.length > 0) ? 'TOUR' : 'HOMESTAY';

      // 2. Quy đổi Trạng thái từ BE sang UI
      let uiStatus: 'PAID' | 'PENDING' | 'REFUNDED' = 'PENDING';
      if (trip.status === 'UPCOMING' || trip.status === 'COMPLETED') {
        uiStatus = 'PAID';
      } else if (trip.status === 'CANCELLED') {
        uiStatus = 'REFUNDED';
      }

      // 3. Tính toán số đêm
      const checkInDate = new Date(trip.checkIn);
      const checkOutDate = new Date(trip.checkOut);
      const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));

      return {
        bookingCode: trip.bookingCode,
        title: trip.propertyName,
        subtitle: `Check-in: ${trip.checkIn} • ${nights} Đêm • ${trip.totalGuests} Khách`,
        date: trip.checkIn, 
        paymentMethod: 'Chuyển khoản / Thẻ', 
        amount: trip.totalPrice,
        status: uiStatus,
        type: recordType
      };
    });
  });

  // --- CÁC HÀM COMPUTED TỰ ĐỘNG TÍNH TOÁN THEO THỜI GIAN THỰC ---

  totalSpent = computed(() => {
    return this.invoices()
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0);
  });

  spendingPercentage = computed(() => {
    return Math.min(Math.round((this.totalSpent() / this.SPENDING_LIMIT) * 100), 100);
  });

  pendingCount = computed(() => {
    return this.invoices().filter(inv => inv.status === 'PENDING').length;
  });

  upcomingPayment = computed(() => {
    const pending = this.invoices().filter(inv => inv.status === 'PENDING');
    return pending.length > 0 ? pending[0] : null;
  });

  filteredInvoices = computed(() => {
    let result = this.invoices();
    
    // Lọc theo Text
    const q = this.searchQuery().toLowerCase();
    if (q) {
      result = result.filter(inv => 
        inv.bookingCode.toLowerCase().includes(q) || 
        inv.title.toLowerCase().includes(q)
      );
    }

    // Lọc theo Loại
    if (this.filterType() !== 'ALL') {
      result = result.filter(inv => inv.type === this.filterType());
    }

    return result;
  });

  ngOnInit(): void {
    this.loadRealInvoiceData();
  }

  loadRealInvoiceData() {
    // CỰC KỲ GỌN NHẸ: Chỉ cần gọi lệnh để Service bắn API. 
    // Data về sẽ tự nhảy vào myTrips -> tự động map qua computed 'invoices' bên trên
    this.tripService.fetchUserTrips();
  }

  downloadInvoice(code: string) {
    console.log('Đang tải hóa đơn cho:', code);
    // Logic tải PDF ở đây
  }
}