import { Component, inject, OnInit, signal } from '@angular/core';
import { CheckoutContact } from './components/checkout-contact/checkout-contact';
import { CheckoutPolicies } from './components/checkout-policies/checkout-policies';
import { CheckoutPayment } from './components/checkout-payment/checkout-payment';
import { CheckoutSummary } from './components/checkout-summary/checkout-summary';
import { BookingService } from '../../core/services/booking/booking.service';
import { PaymentService } from '../../core/services/payment/payment.service'; // <<< 1. INJECT THÊM SERVICE THANH TOÁN
import { ActivatedRoute, Router } from '@angular/router';
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
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService); // <<< 2. KHAI BÁO INJECT
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

    const isRequestMode = this.isRequestMode;

    if (!isRequestMode) {

      this.bookingService.updateContactInfo(data.bookingCode, updatePayload).pipe(
        switchMap(() => this.paymentService.confirmCheckout({
          bookingCode: data.bookingCode, // Bốc lấy ID vật lý (BIGINT) của Booking trong DB
          paymentMethod: method,
          userVoucherId: this.bookingService.appliedVoucherId() // Thêm ID voucher
        }))
      ).subscribe({
        next: (response: any) => {
          this.isProcessing.set(false);
          const result = response.data;

          switch (result.status) {

            case 'SUCCEEDED':
              this.toast.success('Thành công', result.message || 'Thanh toán hoàn tất!');

              this.router.navigate(['/payment-result', data.bookingCode]);
              break;

            case 'REDIRECT':
              window.location.href = result.redirectUrl;
              break;

            case 'PENDING':
              // Chọn chuyển khoản thủ công -> Đá sang trang hiển thị số tài khoản kèm cú pháp chuyển khoản
              this.toast.info('Đơn hàng chờ xử lý', result.message);
              this.router.navigate(['/checkout/transfer-instructions'], { queryParams: { code: data.bookingCode } });
              break;

            default:
              this.toast.error('Lỗi', 'Trạng thái xử lý thanh toán không hợp lệ.');
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.toast.error('Lỗi', err.error?.message || 'Không thể xử lý thanh toán. Vui lòng thử lại!');
        }
      });

    } else {
      // LUỒNG GỬI YÊU CẦU ĐẶT PHÒNG TRƯỚC (Giữ nguyên logic chuẩn của bác)
      this.bookingService.updateContactInfo(data.bookingCode, updatePayload).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.toast.success('Yêu cầu đã gửi', 'Vui lòng chờ Chủ nhà xác nhận!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isProcessing.set(false);
          this.toast.error('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại!');
        }
      });
    }
  }

  onPaymentMethodChange(method: string) {
    this.selectedPaymentMethod.set(method);
  }

  get isRequestMode(): boolean {
    const data = this.checkoutData();
    if (!data) return false;
    if (data.approved === true) {
      return false;
    }
    return data.isInstantBook === false;
  }
}