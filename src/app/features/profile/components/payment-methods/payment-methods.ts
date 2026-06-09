import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPaymentMethod } from '../../../../core/models/payment/user-payment-method.model';
import { PaymentService } from '../../../../core/services/payment/payment.service';
import { AddCardModal } from '../../../../shared/components/add-card-modal/add-card-modal';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule,AddCardModal],
  templateUrl: './payment-methods.html'
})
export class PaymentMethods implements OnInit {
  private paymentService = inject(PaymentService);

  isAddingNew = signal(false);
  
  // Khởi tạo mảng rỗng sẵn sàng hứng dữ liệu sạch từ DB
  methods = signal<UserPaymentMethod[]>([]);
 

  ngOnInit(): void {
    this.loadCards();
  }

  // Hàm lôi dữ liệu từ DB lên đổ vào Signal
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

  // Kích hoạt đổi thẻ mặc định và reload lại danh sách để đồng bộ DB
  async setAsDefault(id: number) {
    try {
      await this.paymentService.setPrimaryCard(id);
      await this.loadCards(); // Tải lại để nhận diện chuẩn dấu tích Primary từ BE
    } catch (error) {
      console.error('Lỗi cấu hình thẻ mặc định:', error);
    }
  }

  // Kích hoạt xóa thẻ khỏi hệ thống
  async removeMethod(id: number) {
    if (!confirm('Bạn có chắc chắn muốn hủy liên kết phương thức thanh toán này?')) return;
    try {
      await this.paymentService.deleteCard(id);
      // Cập nhật nhanh UI cho mượt trước khi reload
      this.methods.update(list => list.filter(m => m.id !== id));
    } catch (error) {
      console.error('Lỗi xóa thẻ:', error);
    }
  }

  // ==========================================
  // DỰNG ĐỘNG CÁC ĐỒ CHƠI TRANG TRÍ CHO UI (MAPPER THẦN THÁNH)
  // ==========================================

  // Tự động nhả màu nền cao cấp dựa theo Brand của thẻ dưới DB
getBgClass(brand: string): string {
    if (!brand) return 'bg-gradient-to-br from-[#1c1c19] via-[#31302d] to-[#1c1c19]'; // Fallback nếu chưa load xong data
    
    const b = brand.toUpperCase();
    
    // Nếu là VISA -> Trả về mã màu Emerald Metallic của ông bằng Tailwind
    if (b.includes('VISA')) {
      return 'bg-gradient-to-br from-[#173124] via-[#2d4739] to-[#173124] shadow-[0_20px_40px_-10px_rgba(23,49,36,0.3)]';
    }
    
    // Nếu là MASTERCARD -> Trả về mã màu Obsidian Gold bằng Tailwind
    if (b.includes('MASTERCARD')) {
      return 'bg-gradient-to-br from-[#1c1c19] via-[#31302d] to-[#1c1c19] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)]';
    }
    
    // Thẻ mặc định khác (Màu đen Matte)
    return 'bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950';
  }

  // Tự động map link logo xịn sò từ internet theo Brand của thẻ
  getBrandLogoUrl(brand: string): string {
    const b = brand.toUpperCase();
    if (b.includes('VISA')) return 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png';
    if (b.includes('MASTERCARD')) return 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg';
    return '';
  }
}