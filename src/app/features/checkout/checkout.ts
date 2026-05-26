import { Component, inject, OnInit, signal } from '@angular/core';
import { CheckoutContact } from './components/checkout-contact/checkout-contact';
import { CheckoutPolicies } from './components/checkout-policies/checkout-policies';
import { CheckoutPayment } from './components/checkout-payment/checkout-payment';
import { CheckoutSummary } from './components/checkout-summary/checkout-summary';
import { BookingService } from '../../core/services/booking/booking.service';
import { ActivatedRoute, Router } from '@angular/router'; // ĐÃ IMPORT ROUTER
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators'; 
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CheckoutContact, CheckoutPolicies, CheckoutPayment, CheckoutSummary, CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router); // INJECT ROUTER
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);
  
  public checkoutData = this.bookingService.checkoutData;
  public isProcessing = signal(false);
  public selectedPaymentMethod = signal<string>('VNPAY');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const bookingCode = params['code'];
      if (bookingCode) {
        this.fetchCheckoutDetails(bookingCode);
      }
    });
  }

  private fetchCheckoutDetails(code: string): void {
    console.log('Đang đồng bộ dữ liệu đơn hàng từ DB cho mã:', code);

    this.bookingService.getBookingDetails(code).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bookingService.checkoutData.set(response.data);
          console.log('Đồng bộ dữ liệu thành công cho đơn hàng:', response.data);
        } else {
          console.error('Không tìm thấy dữ liệu cho mã đơn hàng này');
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API đọc thông tin đơn hàng:', err);
      }
    });
  }

  onConfirmAndPay(): void {
    const contact = this.bookingService.contactInfo(); 
    if (!contact.guestName || !contact.guestPhone || !contact.guestEmail) {
      this.toast.error('Lỗi', 'Vui lòng nhập đầy đủ thông tin người lưu trú!');
      return;
    }
    
    const data = this.checkoutData();
    const method = this.selectedPaymentMethod();

    if (!data || this.isProcessing()) return;
    this.isProcessing.set(true);

    const updatePayload = {
      guestName: contact.guestName,
      phone: contact.guestPhone,
      email: contact.guestEmail,
      specialRequests: contact.specialRequests
    };

    // --- ĐIỀU KIỆN CHUẨN ĐỂ XÁC ĐỊNH LUỒNG ---
    // Chỉ "Gửi yêu cầu" khi: Phòng KHÔNG đặt tức thì VÀ Đơn hàng ĐANG LÀ PENDING (lần đầu)
    const isRequestMode = this.isRequestMode;

    if (!isRequestMode) {
      // LUỒNG THANH TOÁN (Áp dụng cho đơn đã duyệt AWAITING_PAYMENT hoặc phòng Instant)
      if (method === 'TRANSFER') {
        this.toast.error('Lỗi', 'Tính năng chuyển khoản đang bảo trì!');
        this.isProcessing.set(false);
        return;
      }

      this.bookingService.updateContactInfo(data.bookingCode, updatePayload).pipe(
        switchMap(() => this.bookingService.getPaymentUrl(data.bookingCode, method))
      ).subscribe({
        next: (paymentUrl: string) => { window.location.href = paymentUrl; },
        error: (err) => { this.isProcessing.set(false); this.toast.error('Lỗi', 'Không thể khởi tạo thanh toán. Vui lòng thử lại!'); }
      });

    } else {
      // LUỒNG GỬI YÊU CẦU (Chỉ chạy lần đầu)
      this.bookingService.updateContactInfo(data.bookingCode, updatePayload).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.toast.success('Yêu cầu đã gửi', 'Vui lòng chờ Chủ nhà xác nhận!');
          this.router.navigate(['/']); 
        },
        error: (err) => { this.isProcessing.set(false); this.toast.error('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại!'); }
      });
    }
  }
  onPaymentMethodChange(method: string) {
    this.selectedPaymentMethod.set(method);
  }
  // Thêm hàm này vào class Checkout
// Trong class Checkout
get isRequestMode(): boolean {
  const data = this.checkoutData();
  if (!data) return false;

  // CÁCH FIX DỨT ĐIỂM:
  // Nếu đã từng được duyệt (isApproved == true) thì DÙ STATUS LÀ GÌ
  // cũng KHÔNG ĐƯỢC PHÉP vào luồng "Gửi yêu cầu" nữa.
  if (data.approved === true) {
      return false; 
  }

  // Nếu chưa từng được duyệt, mới check status PENDING để hiện nút Gửi yêu cầu
  return data.isInstantBook === false;
}
}