import { Component, inject, OnInit } from '@angular/core';
import { CheckoutContact } from './components/checkout-contact/checkout-contact';
import { CheckoutPolicies } from './components/checkout-policies/checkout-policies';
import { CheckoutPayment } from './components/checkout-payment/checkout-payment';
import { CheckoutSummary } from './components/checkout-summary/checkout-summary';
import { BookingService } from '../../core/services/booking/booking.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-checkout',
  imports: [CheckoutContact, CheckoutPolicies, CheckoutPayment, CheckoutSummary,CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);
  public checkoutData = this.bookingService.checkoutData;
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
}
