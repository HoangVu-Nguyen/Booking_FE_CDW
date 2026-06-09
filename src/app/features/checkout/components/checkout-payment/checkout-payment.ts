import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPaymentMethod } from '../../../../core/models/payment/user-payment-method.model';
import { PaymentService } from '../../../../core/services/payment/payment.service';


@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-payment.html',
  styleUrl: './checkout-payment.css',
})
export class CheckoutPayment implements OnInit {
  private paymentService = inject(PaymentService);

  @Output() methodChange = new EventEmitter<string>();
  
  selectedMethod = 'VNPAY';
  
  // Signal hứng danh sách thẻ tín dụng đã liên kết từ DB
  savedCards = signal<UserPaymentMethod[]>([]);

  ngOnInit(): void {
    this.loadUserCards();
  }

  async loadUserCards() {
    try {
      const res = await this.paymentService.getPaymentMethods();
      if (res && res.data) {
        this.savedCards.set(res.data);
        
        // MẸO TRẢI NGHIỆM: Nếu user có thẻ mặc định (isPrimary), tự động chọn luôn thẻ đó làm mặc định thanh toán
        const primaryCard = res.data.find(c => c.isPrimary);
        if (primaryCard) {
          this.onMethodSelect(`CARD_${primaryCard.id}`);
        }
      }
    } catch (error) {
      console.error('Không thể load danh sách thẻ test của user:', error);
    }
  }

  onMethodSelect(method: string) {
    this.selectedMethod = method;
    // Bắn chuỗi lựa chọn ra ngoài Component Cha (Ví dụ: 'VNPAY', 'MOMO', 'CARD_1', 'CARD_2')
    this.methodChange.emit(this.selectedMethod);
  }

  // Hàm bổ trợ lấy nhanh Logo hãng thẻ cho UI
  getCardLogo(brand: string): string {
    const b = brand.toUpperCase();
    if (b.includes('VISA')) return 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png';
    if (b.includes('MASTERCARD')) return 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg';
    return '';
  }
}