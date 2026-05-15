import { Component, inject, OnInit, signal } from '@angular/core';
import { CheckoutContact } from './components/checkout-contact/checkout-contact';
import { CheckoutPolicies } from './components/checkout-policies/checkout-policies';
import { CheckoutPayment } from './components/checkout-payment/checkout-payment';
import { CheckoutSummary } from './components/checkout-summary/checkout-summary';
import { BookingService } from '../../core/services/booking/booking.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-checkout',
  imports: [CheckoutContact, CheckoutPolicies, CheckoutPayment, CheckoutSummary, CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);
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
    const data = this.checkoutData();
    const method = this.selectedPaymentMethod();

    if (!data || this.isProcessing()) return;

    // Chặn luồng TRANSFER nếu bác chưa code chức năng up bill
    if (method === 'TRANSFER') {
      alert("Tính năng chuyển khoản thủ công đang bảo trì, vui lòng chọn VNPAY hoặc MoMo!");
      return;
    }

    this.isProcessing.set(true);

    // Gọi API với method tương ứng
    this.bookingService.getPaymentUrl(data.bookingCode, method).subscribe({
      next: (paymentUrl: string) => {
        console.log(paymentUrl)
        // Redirect sang VNPAY hoặc MoMo tùy vào url trả về
        window.location.href = paymentUrl;
      },
      error: (err) => {
        this.isProcessing.set(false);
        console.error('❌ Lỗi tạo link thanh toán:', err);
        alert('Không thể kết nối cổng thanh toán. Vui lòng thử lại!');
      }
    });
  }


  // Hàm hứng sự kiện từ component con
  onPaymentMethodChange(method: string) {
    this.selectedPaymentMethod.set(method);
    console.log("Khách đã đổi sang cổng:", method);
  }
}
