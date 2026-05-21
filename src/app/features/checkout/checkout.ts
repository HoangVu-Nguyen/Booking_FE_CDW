import { Component, inject, OnInit, signal } from '@angular/core';
import { CheckoutContact } from './components/checkout-contact/checkout-contact';
import { CheckoutPolicies } from './components/checkout-policies/checkout-policies';
import { CheckoutPayment } from './components/checkout-payment/checkout-payment';
import { CheckoutSummary } from './components/checkout-summary/checkout-summary';
import { BookingService } from '../../core/services/booking/booking.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

// NHỚ IMPORT THÊM switchMap Ở ĐÂY NHÉ BÁC
import { switchMap } from 'rxjs/operators'; 

@Component({
  selector: 'app-checkout',
  standalone: true, // Nếu bác đang dùng standalone component
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

  // --- HÀM CHỐT HẠ (ĐÃ BỌC SWITCHMAP CHẠY NỐI TIẾP API) ---
  onConfirmAndPay(): void {
    const contact = this.bookingService.contactInfo(); 

    // 1. Validate Form
    if (!contact.guestName || !contact.guestPhone || !contact.guestEmail) {
      alert("Vui lòng nhập đầy đủ thông tin người lưu trú!");
      return;
    }
    
    const data = this.checkoutData();
    const method = this.selectedPaymentMethod();

    if (!data || this.isProcessing()) return;

    // 2. Chặn luồng TRANSFER nếu chưa phát triển
    if (method === 'TRANSFER') {
      alert("Tính năng chuyển khoản thủ công đang bảo trì, vui lòng chọn VNPAY hoặc MoMo!");
      return;
    }

    this.isProcessing.set(true);

    // 3. Đóng gói Payload thông tin liên hệ
    const updatePayload = {
      guestName: contact.guestName,
      phone: contact.guestPhone,
      email: contact.guestEmail,
      specialRequests: contact.specialRequests
    };
    console.log('Payload thông tin liên hệ chuẩn bị gửi lên API:', updatePayload);

    // 4. CHẠY API NỐI TIẾP: Cập nhật DB -> Thành công thì xin Link VNPAY
    this.bookingService.updateContactInfo(data.bookingCode, updatePayload).pipe(
      
      // switchMap giúp "nối cầu", hứng kết quả của API 1 và tự động kích hoạt API 2
      switchMap(() => this.bookingService.getPaymentUrl(data.bookingCode, method))
    ).subscribe({
      next: (paymentUrl: string) => {
        console.log('Link thanh toán đã tạo thành công:', paymentUrl);
        // Đá khách sang cổng VNPAY/MoMo
        window.location.href = paymentUrl;
      },
      error: (err) => {
        this.isProcessing.set(false); // Nhả nút loading ra nếu lỗi
        console.error('❌ Lỗi xử lý thanh toán:', err);
        alert('Có lỗi xảy ra khi cập nhật thông tin hoặc kết nối cổng thanh toán!');
      }
    });
  }

  // Hàm hứng sự kiện từ component con
  onPaymentMethodChange(method: string) {
    this.selectedPaymentMethod.set(method);
    console.log("Khách đã đổi sang cổng:", method);
  }
}