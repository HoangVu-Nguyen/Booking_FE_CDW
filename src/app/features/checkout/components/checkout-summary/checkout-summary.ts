import { Component, inject, OnInit } from '@angular/core';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { VoucherService } from '../../../../core/services/voucher/voucher.service';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-summary',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './checkout-summary.html',
  styleUrl: './checkout-summary.css',
})
export class CheckoutSummary implements OnInit {
  private bookingService = inject(BookingService);
  private voucherService = inject(VoucherService);

  public data = this.bookingService.checkoutData;
  public myVouchers: any[] = [];
  public selectedVoucher: any = null;
  public isVoucherModalOpen = false;

  ngOnInit() {
    this.loadVouchers();
  }

  loadVouchers() {
    const bookingCode = this.data()?.bookingCode;
    if (!bookingCode) return;
    
    this.voucherService.getApplicableVouchers(bookingCode).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.myVouchers = res.data;
        }
      }
    });
  }

  openVoucherModal() {
    this.isVoucherModalOpen = true;
  }

  closeVoucherModal() {
    this.isVoucherModalOpen = false;
  }



  applyVoucher(voucher: any) {
    this.selectedVoucher = voucher;
    this.bookingService.appliedVoucherId.set(voucher.id);
    this.closeVoucherModal();
  }

  removeVoucher() {
    this.selectedVoucher = null;
    this.bookingService.appliedVoucherId.set(null);
  }

  getBaseTotal(): number {
    const d = this.data();
    if (!d) return 0;
    return (d.roomSubtotal || 0) + (d.tourSubtotal || 0);
  }

  getDiscountAmount(): number {
    if (!this.selectedVoucher) return 0;
    
    // The discount logic from backend is based on basePrice (room + tour) but capped at finalGrandTotal.
    // However, the backend applies % on `basePrice` which doesn't include tax, 
    // wait, in backend: `basePrice = basePrice.add(tourAmount)` which is room + tour.
    const basePrice = this.getBaseTotal(); 
    
    let discount = 0;
    if (this.selectedVoucher.discountType === 'FIXED_AMOUNT') {
      discount = this.selectedVoucher.discountValue;
    } else if (this.selectedVoucher.discountType === 'PERCENTAGE') {
      discount = basePrice * (this.selectedVoucher.discountValue / 100);
      if (this.selectedVoucher.maxDiscount && discount > this.selectedVoucher.maxDiscount) {
        discount = this.selectedVoucher.maxDiscount;
      }
    }
    
    // Capping at grandTotal (including tax)
    const grandTotal = this.data().grandTotal || 0;
    return discount > grandTotal ? grandTotal : discount;
  }

  getFinalTotal(): number {
    const base = this.data()?.grandTotal || 0;
    return Math.max(0, base - this.getDiscountAmount());
  }
}
