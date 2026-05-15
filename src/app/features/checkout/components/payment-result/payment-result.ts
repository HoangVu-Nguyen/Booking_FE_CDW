import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  private paymentService = inject(PaymentService); // Inject service gọi API bọc ApiService của bác

  // Quản lý trạng thái màn hình tổng
  public status = signal<'loading' | 'success' | 'failed'>('loading');
  
  // Tín hiệu chứa toàn bộ dữ liệu phòng/tour sạch từ Backend trả về
  public bookingData = signal<any>(null);

  ngOnInit() {
    // Lắng nghe URL trả về từ cổng thanh toán
    this.route.queryParams.subscribe(params => {
      let gateway = '';

      // Tự động phân loại cổng dựa trên tham số đặc trưng của VNPAY hoặc MoMo
      if (params['vnp_ResponseCode']) {
        gateway = 'vnpay';
      } else if (params['resultCode']) {
        gateway = 'momo';
      }

      // Nếu nhận diện được cổng hợp lệ, kích hoạt luồng kiểm tra chữ ký số chống hack
      if (gateway) {
        this.paymentService.verifyPayment(gateway, params).subscribe({
          next: (response) => {
            // Check đúng cấu trúc ApiResponse thành công (đơn hợp lệ và đã PAID)
            if (response && response.data) {
              console.log(response)
              this.bookingData.set(response.data); // Cục data gồm: bookingCode, totalPrice, roomName, tours...
              this.status.set('success');
            } else {
              this.status.set('failed');
            }
          },
          error: (err) => {
            // Sai chữ ký bảo mật hoặc giao dịch gốc bị lỗi/hủy, Backend quăng Exception lỗi
            console.error('[PAYMENT ERROR] Lỗi xác thực giao dịch từ hệ thống:', err);
            this.status.set('failed');
          }
        });
      } else {
        // Trường hợp URL bậy bạ, không chứa tham số kết quả thanh toán
        this.status.set('failed');
      }
    });
  }
}