import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscountType, SponsorType } from '../../../../core/enum/offer.enum';
import { VoucherCreateRequest } from '../../../../core/models/request/voucher.request';
import { PropertySummaryResponse } from '../../../../core/models/response/property.response';
import { VoucherResponse } from '../../../../core/models/response/voucher.response';
import { PortfolioService } from '../../../../core/services/manager/portfolio.service';
import { VoucherService } from '../../../../core/services/voucher/voucher.service';


@Component({
  selector: 'app-host-vouchers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './host-vouchers.html'
})
export class HostVouchers implements OnInit {
  isFormOpen = false;
  isLoading = false;
  isSaving = false;
  vouchers: VoucherResponse[] = [];
  properties: PropertySummaryResponse[] = [];
  
  // Form Model
  newVoucher: any = {
    code: '',
    name: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: null,
    max_discount: null,
    min_order_value: null,
    valid_from: '',
    valid_until: '',
    total_issue_limit: null,
    total_usage_limit: null,
    isApplyAll: true,
    applicableHomestayIds: []
  };

  private voucherService = inject(VoucherService);
  private portfolioService = inject(PortfolioService);
  private changeRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadVouchers();
    this.loadProperties();
  }

  loadVouchers() {
    this.isLoading = true;
    this.voucherService.getHostVouchers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.vouchers = res.data;
          console.log(this.vouchers)
        }
        this.isLoading = false;
        this.changeRef.markForCheck()
      },
      error: (err) => {
        console.error('Error loading host vouchers', err);
        this.isLoading = false;
      }
    });
  }

  loadProperties() {
    this.portfolioService.loadProperties().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.properties = res.data;
           this.changeRef.markForCheck()
        }
      },
      error: (err) => console.error('Error loading properties', err)
    });
  }

  openForm() {
    this.resetForm();
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
  }

  resetForm() {
    this.newVoucher = {
      code: '',
      name: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: null,
      max_discount: null,
      min_order_value: null,
      valid_from: '',
      valid_until: '',
      total_issue_limit: null,
      total_usage_limit: null,
      isApplyAll: true,
      applicableHomestayIds: []
    };
  }

  generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newVoucher.code = result;
  }

  toggleHomestaySelection(homestayId: number) {
    const index = this.newVoucher.applicableHomestayIds.indexOf(homestayId);
    if (index === -1) {
      this.newVoucher.applicableHomestayIds.push(homestayId);
    } else {
      this.newVoucher.applicableHomestayIds.splice(index, 1);
    }
  }

  saveVoucher() {
    if (!this.newVoucher.code || !this.newVoucher.name || !this.newVoucher.discount_value || !this.newVoucher.valid_until) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    if (!this.newVoucher.isApplyAll && this.newVoucher.applicableHomestayIds.length === 0) {
      alert('Vui lòng chọn ít nhất một homestay để áp dụng voucher.');
      return;
    }

    this.isSaving = true;

    const request: VoucherCreateRequest = {
      code: this.newVoucher.code,
      name: this.newVoucher.name,
      description: this.newVoucher.description,
      discount_type: this.newVoucher.discount_type as DiscountType,
      discount_value: this.newVoucher.discount_value,
      max_discount: this.newVoucher.max_discount,
      min_order_value: this.newVoucher.min_order_value,
      sponsor_type: SponsorType.HOST_SPONSORED, // Phân biệt là do HOST tạo
      valid_from: this.newVoucher.valid_from ? new Date(this.newVoucher.valid_from).toISOString() : undefined,
      valid_until: this.newVoucher.valid_until ? new Date(this.newVoucher.valid_until).toISOString() : undefined,
      total_issue_limit: this.newVoucher.total_issue_limit,
      total_usage_limit: this.newVoucher.total_usage_limit,
      isApplyAll: this.newVoucher.isApplyAll,
      applicableHomestayIds: this.newVoucher.isApplyAll ? [] : this.newVoucher.applicableHomestayIds
    };

    this.voucherService.createHostVoucher(request).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Đã tạo Voucher thành công!');
          this.closeForm();
          this.loadVouchers();
        } else {
          alert('Lỗi: ' + res.message);
        }
        this.isSaving = false;
         this.changeRef.markForCheck()
      },
      error: (err) => {
        console.error('Error saving host voucher', err);
        alert('Đã có lỗi xảy ra khi tạo Voucher');
        this.isSaving = false;
      }
    });
  }

  deactivateVoucher(id: number) {
    if (confirm('Bạn có chắc chắn muốn ngừng hoạt động voucher này?')) {
      this.voucherService.deactivateHostVoucher(id).subscribe({
        next: (res) => {
          if (res.success) {
            alert('Đã ngừng hoạt động Voucher.');
            this.loadVouchers();
          } else {
            alert('Lỗi: ' + res.message);
          }
        },
        error: (err) => {
          console.error('Error deactivating host voucher', err);
          alert('Đã có lỗi xảy ra khi hủy Voucher');
        }
      });
    }
  }
}
