import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment/payment.service'; // Sửa lại đúng path nhé ông
import { environment } from '../../../../environments/environment';
declare var Stripe: any;

@Component({
  selector: 'app-add-card-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-card-modal.html'
})
export class AddCardModal implements OnInit {
  // ĐÃ KHỬ CODE BẨN: Đổi từ ApiService sang PaymentService chuyên trách
  private paymentService = inject(PaymentService);
   

  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  stripe: any;
  cardElement: any;
  holderName = '';
  isProcessing = signal(false);

  ngOnInit(): void {
    // Khởi tạo Stripe bằng Publishable Key mã test
    this.stripe = Stripe(environment.stripeKey);
    const elements = this.stripe.elements();

    this.cardElement = elements.create('card', {
      style: {
        base: {
          color: '#1c1c19',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '14px',
          '::placeholder': { color: '#a8a29e' }
        }
      }
    });

    this.cardElement.mount('#card-element');
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    if (this.isProcessing()) return;

    this.isProcessing.set(true);
    const errorDisplay = document.getElementById('card-errors')!;
    errorDisplay.textContent = '';

    try {
      // 1. Gọi Service xin mã Client Secret chuẩn chỉnh
      const resIntent = await this.paymentService.createSetupIntent();
      const clientSecret = resIntent.data;

      // 2. Đẩy thông tin thẻ lên cổng bảo mật của Stripe xác thực
      const { setupIntent, error } = await this.stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: { name: this.holderName }
        }
      });

      if (error) {
        errorDisplay.textContent = error.message;
        this.isProcessing.set(false);
      } else if (setupIntent && setupIntent.status === 'succeeded') {
        
        // Đóng gói payload khớp 100% với cấu trúc DTO Request ở Backend
        const confirmRequest = {
          paymentMethodId: setupIntent.payment_method,
          cardHolderName: this.holderName
        };

        // 3. Gọi Service đẩy DTO sạch về Backend để ghi nhận DB
        await this.paymentService.confirmPaymentMethod(confirmRequest);
        
        this.success.emit(); // Kích hoạt reload ví ở trang lớn
        this.close.emit();
      }
    } catch (err: any) {
      errorDisplay.textContent = 'Có lỗi xảy ra trong quá trình kết nối với máy chủ.';
      this.isProcessing.set(false);
    }
  }
}