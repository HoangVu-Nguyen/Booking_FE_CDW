import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs'; // <<< IMPORT THẰNG NÀY ĐỂ GỘP LUỒNG
import { PaymentHeader } from './components/payment-header/payment-header';
import { JourneyOverview } from './components/journey-overview/journey-overview';
import { EcoImpact } from './components/eco-impact/eco-impact';
import { CostSummary } from './components/cost-summary/cost-summary';
import { NextSteps } from './components/next-steps/next-steps';
import { SupportCard } from './components/support-card/support-card';
import { PaymentService } from '../../../../core/services/payment/payment.service';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [PaymentHeader, JourneyOverview, EcoImpact, CostSummary, NextSteps, SupportCard],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.css',
})
export class PaymentResult implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  public status = signal<'loading' | 'success' | 'failed'>('loading');
  public bookingData = signal<any>(null);

  ngOnInit() {
    // KÍCH HOẠT ĐI DÂY KÉP: Đọc song song cả Route param và Query param
    combineLatest([this.route.params, this.route.queryParams]).subscribe({
      next: ([params, queryParams]) => {
        
        // 1. Lấy mã đơn hàng từ trên khúc xương đường dẫn (:code)
        const bookingCode = params['code']; 
        
        // 2. Nhận diện xem có phải là cú hích callback từ cổng ngoài không
        let gateway = '';
        if (queryParams['vnp_ResponseCode']) {
          gateway = 'vnpay';
        } else if (queryParams['resultCode']) {
          gateway = 'momo';
        }

        // =================================================================
        // LUỒNG 1: NẾU CÓ DẤU VẾT CỦA VNPAY / MOMO CALLBACK
        // =================================================================
        if (gateway) {
          // Bắn nguyên cục queryParams chứa mã băm chữ ký số về cho Backend kiểm tra chống hack
          this.paymentService.verifyPayment(gateway, queryParams).subscribe({
            next: (response) => {
              if (response && response.data) {
                this.bookingData.set(response.data); 
                this.status.set('success');
              } else {
                this.status.set('failed');
              }
            },
            error: (err) => {
              console.error('Xác thực chữ ký số thất bại:', err);
              this.status.set('failed');
            }
          });
        } 
        // =================================================================
        // LUỒNG 2: NẾU LÀ STRIPE QUICK PAY ĐI QUA (Không có query, chỉ có code trên route)
        // =================================================================
        else if (bookingCode) {
          this.paymentService.getPaymentSuccessDetails(bookingCode).subscribe({
            next: (response) => {
              if (response && response.data) {
                this.bookingData.set(response.data);
                this.status.set('success');
              } else {
                this.status.set('failed');
              }
            },
            error: (err) => {
              console.error('Lỗi kéo thông tin đơn thẻ Stripe:', err);
              this.status.set('failed');
            }
          });
        } 
        // LUỒNG 3: URL TRỐNG KHÔNG HOẶC SAI ĐỊNH DẠNG
        else {
          this.status.set('failed');
        }
      },
      error: (err) => {
        this.status.set('failed');
      }
    });
  }
}