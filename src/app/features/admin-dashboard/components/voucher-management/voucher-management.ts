import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoucherService } from '../../../../core/services/voucher/voucher.service';
import { VoucherCreateRequest } from '../../../../core/models/request/voucher.request';
import { VoucherResponse } from '../../../../core/models/response/voucher.response';
import { DiscountType, SponsorType } from '../../../../core/enum/offer.enum';


@Component({
  selector: 'app-voucher-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './voucher-management.html'
})
export class VoucherManagement implements OnInit {
  isFormOpen = false;
  isSaving = false;
  isLoading = false;
  vouchers: VoucherResponse[] = [];
  private changeRef = inject(ChangeDetectorRef);

  constructor(private voucherService: VoucherService) { }

  ngOnInit() {
    this.loadVouchers();
  }

  loadVouchers() {
    this.isLoading = true;
    this.voucherService.getAllVouchers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vouchers = res.data;
          console.log(this.vouchers)
        }
        this.isLoading = false;

        this.changeRef.markForCheck();
      },
      error: (err) => {
        console.error('Error loading vouchers', err);
        this.isLoading = false;
        this.changeRef.markForCheck();
      }
    });
  }

  newVoucher: any = {
    code: '',
    name: '',
    description: '',
    discount_type: 'FIXED_AMOUNT',
    discount_value: null,
    max_discount: null,
    min_order_value: null,
    points_required: 0,
    valid_from: '',
    valid_until: '',
    total_issue_limit: null,
    total_usage_limit: null
  };

  openForm() {
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
  }

  saveVoucher() {
    if (!this.newVoucher.code || !this.newVoucher.name || !this.newVoucher.discount_value) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    this.isSaving = true;

    // Convert string to Date string format if needed (it comes as datetime-local which is almost fine, but maybe add Z)
    const request: VoucherCreateRequest = {
      code: this.newVoucher.code,
      name: this.newVoucher.name,
      description: this.newVoucher.description,
      discount_type: this.newVoucher.discount_type as DiscountType,
      discount_value: this.newVoucher.discount_value,
      max_discount: this.newVoucher.max_discount,
      min_order_value: this.newVoucher.min_order_value,
      points_required: this.newVoucher.points_required,
      sponsor_type: SponsorType.MEMBER_REWARD, // Default for now
      valid_from: this.newVoucher.valid_from ? new Date(this.newVoucher.valid_from).toISOString() : undefined,
      valid_until: this.newVoucher.valid_until ? new Date(this.newVoucher.valid_until).toISOString() : undefined,
      total_issue_limit: this.newVoucher.total_issue_limit,
      total_usage_limit: this.newVoucher.total_usage_limit
    };

    this.voucherService.createVoucher(request).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Đã lưu Voucher thành công!');
          this.closeForm();
          this.loadVouchers();
        } else {
          alert('Lỗi: ' + res.message);
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving voucher', err);
        alert('Đã có lỗi xảy ra khi lưu Voucher');
        this.isSaving = false;
      }
    });
  }

  generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newVoucher.code = result;
  }
}
