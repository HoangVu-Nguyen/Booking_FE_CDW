import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VoucherService } from '../../core/services/voucher/voucher.service';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {
  offers: any[] = [];
  pointVouchers: any[] = [];
  currentPoints = 2500;
  isLoading = false;
  private changeRef = inject(ChangeDetectorRef);

  constructor(private voucherService: VoucherService) {}

  ngOnInit() {
    this.loadPoints();
    this.loadVouchers();
  }

  loadPoints() {
    this.voucherService.getCurrentUserPoints().subscribe({
      next: (res) => {
        if (res.success && res.data !== undefined) {
          this.currentPoints = res.data;
          this.changeRef.markForCheck();
        }
      },
      error: (err) => {
        console.error('Failed to load user points', err);
      }
    });
  }

  loadVouchers() {
    this.isLoading = true;
    this.voucherService.getAllVouchers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const activeVouchers = res.data.filter(v => v.isActive !== false); // assuming isActive could be null, but we want to show it unless explicitly false

          this.offers = activeVouchers
            .filter(v => !v.pointsRequired || v.pointsRequired === 0)
            .map(v => ({
              id: v.id,
              title: v.name,
              description: v.description,
              code: v.code,
              discount: v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString('vi-VN')}đ`,
              validUntil: v.validUntil ? new Date(v.validUntil).toLocaleDateString('vi-VN') : 'Không giới hạn',
              image: this.getRandomImage(v.id || Math.random()),
              tag: v.discountType === 'PERCENTAGE' ? 'SALE' : 'HOT'
            }));

          this.pointVouchers = activeVouchers
            .filter(v => v.pointsRequired && v.pointsRequired > 0)
            .map(v => ({
              id: v.id,
              title: v.name,
              pointsRequired: v.pointsRequired,
              description: v.description,
              icon: this.getRandomIcon(v.id || Math.random())
            }));
        }
        this.isLoading = false;
        this.changeRef.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load vouchers', err);
        this.isLoading = false;
        this.changeRef.markForCheck();
      }
    });
  }

  getRandomImage(seed: number) {
    const images = [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-c6a4d142104d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    return images[Math.floor(seed) % images.length] || images[0];
  }

  getRandomIcon(seed: number) {
    const icons = ['🎫', '🎟️', '✨', '🎁', '💎'];
    return icons[Math.floor(seed) % icons.length] || icons[0];
  }

  saveVoucher(voucher: any) {
    this.voucherService.redeemVoucher(voucher.id).subscribe({
      next: (res) => {
        if (res.success) {
          alert(`Đã lưu thành công: ${voucher.title}! Bạn có thể xem trong Kho Voucher.`);
        } else {
          alert('Không thể lưu voucher: ' + res.message);
        }
      },
      error: (err) => {
        console.error('Save voucher error', err);
        alert('Đã xảy ra lỗi khi lưu voucher.');
      }
    });
  }

  redeemVoucher(voucher: any) {
    if (this.currentPoints < voucher.pointsRequired) {
       alert('Bạn không đủ điểm thưởng để đổi voucher này.');
       return;
    }
    
    // Call API to redeem
    this.voucherService.redeemVoucher(voucher.id).subscribe({
      next: (res) => {
        if (res.success) {
          alert(`Đổi thành công: ${voucher.title}! Mã voucher sẽ được gửi vào mục Ưu đãi của tôi.`);
          // Reload points to reflect the deduction from backend
          this.loadPoints();
        } else {
          alert('Không thể đổi voucher: ' + res.message);
        }
      },
      error: (err) => {
        console.error('Redeem voucher error', err);
        alert('Đã xảy ra lỗi hệ thống khi đổi điểm lấy voucher.');
      }
    });
  }
}
