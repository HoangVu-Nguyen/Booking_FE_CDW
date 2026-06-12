import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common'; // Thêm Pipe định dạng
import { FormsModule } from '@angular/forms';
import { UserPaymentMethod } from '../../../../core/models/payment/user-payment-method.model';
import { PaymentService } from '../../../../core/services/payment/payment.service';
import { AddCardModal } from '../../../../shared/components/add-card-modal/add-card-modal';
import { ConfirmationService } from '../../../../core/services/confirm/confirm.service';
import { TripService } from '../../../../core/services/trip/trip.service'; // Import TripService

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCardModal, DecimalPipe, DatePipe], // Khai báo Pipes
  templateUrl: './payment-methods.html'
})
export class PaymentMethods implements OnInit {
  private paymentService = inject(PaymentService);
  private confirmService = inject(ConfirmationService);
  private tripService = inject(TripService); // Inject TripService

  isAddingNew = signal(false);
  methods = signal<UserPaymentMethod[]>([]);

  // MAPPING LỊCH SỬ GIAO DỊCH TỰ ĐỘNG
  transactions = computed(() => {
    const trips = this.tripService.myTrips();
    if (!trips || trips.length === 0) return [];

    return trips.map(trip => {
      const isTour = trip.tours && trip.tours.length > 0;
      return {
        bookingCode: trip.bookingCode,
        title: trip.propertyName,
        date: trip.checkIn, // Backend trả về ISO String
        amount: trip.totalPrice,
        type: isTour ? 'Trải nghiệm' : 'Homestay',
        icon: isTour ? 'explore' : 'apartment',
        // Map status sang chuẩn của UI
        status: (trip.status === 'UPCOMING' || trip.status === 'COMPLETED') ? 'SUCCESS' :
                trip.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING'
      };
    });
  });

  ngOnInit(): void {
    this.loadCards();
    this.tripService.fetchUserTrips(); // Kích hoạt kéo API lịch sử giao dịch
  }

  async loadCards() {
    try {
      const response = await this.paymentService.getPaymentMethods();
      if (response && response.data) {
        this.methods.set(response.data);
      }
    } catch (error) {
      console.error('❌ Thất bại khi load ví tiền tài khoản:', error);
    }
  }

  toggleAddForm() {
    this.isAddingNew.update(v => !v);
  }

  async setAsDefault(id: number) {
    this.confirmService.confirm(
      'Thay đổi thẻ mặc định',
      'Bạn có chắc chắn muốn đặt thẻ này làm tài khoản thanh toán/nhận tiền chính không?',
      async () => {
        try {
          await this.paymentService.setPrimaryCard(id);
          await this.loadCards(); 
          this.confirmService.close(); 
        } catch (error) {
          console.error('Lỗi cấu hình thẻ mặc định:', error);
        }
      }
    );
  }

  async removeMethod(id: number) {
    this.confirmService.confirm(
      'Xóa thẻ đã liên kết',
      'Bạn có chắc chắn muốn xóa thẻ thanh toán này không? Nếu đây là thẻ mặc định, hệ thống sẽ tự động chọn một thẻ khác để thay thế.',
      async () => {
        try {
          await this.paymentService.deleteCard(id);
          this.methods.update(list => list.filter(m => m.id !== id));
          this.confirmService.close(); 
        } catch (error) {
          console.error('Lỗi xóa thẻ:', error);
        }
      }
    );
  }

  getBgClass(brand: string): string {
    if (!brand) return 'bg-gradient-to-br from-[#1c1c19] via-[#31302d] to-[#1c1c19]'; 
    const b = brand.toUpperCase();
    if (b.includes('VISA')) {
      return 'bg-gradient-to-br from-[#173124] via-[#2d4739] to-[#173124] shadow-[0_20px_40px_-10px_rgba(23,49,36,0.3)]';
    }
    if (b.includes('MASTERCARD')) {
      return 'bg-gradient-to-br from-[#1c1c19] via-[#31302d] to-[#1c1c19] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)]';
    }
    return 'bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950';
  }

  getBrandLogoUrl(brand: string): string {
    const b = brand.toUpperCase();
    if (b.includes('VISA')) return 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png';
    if (b.includes('MASTERCARD')) return 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg';
    return '';
  }
}