import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserVoucherResponse } from '../../../../core/models/response/user-voucher.response';
import { VoucherService } from '../../../../core/services/voucher/voucher.service';


@Component({
  selector: 'app-my-vouchers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-vouchers.html'
})
export class MyVouchers implements OnInit {
  activeTab = 'AVAILABLE'; // 'AVAILABLE', 'USED', 'EXPIRED'
  isLoading = false;
  
  myVouchers: UserVoucherResponse[] = [];
  selectedVoucher: any = null;
  isModalOpen = false;
  private changeRef = inject(ChangeDetectorRef);

  constructor(private voucherService: VoucherService) {}

  get filteredVouchers() {
    return this.myVouchers.filter(v => v.status === this.activeTab);
  }

  ngOnInit() {
    this.loadMyVouchers();

  }

  loadMyVouchers() {
    this.isLoading = true;
    this.voucherService.getMyVouchers().subscribe({
      next: (res) => {
        console.log(res)
        if (res.success && res.data) {
          this.myVouchers = res.data;
        }
        this.isLoading = false;
        this.changeRef.markForCheck();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách voucher', err);
        this.isLoading = false;
        this.changeRef.markForCheck();
      }
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  openVoucherDetails(voucher: any) {
    this.selectedVoucher = voucher;
    this.isModalOpen = true;
  }

  closeVoucherDetails() {
    this.isModalOpen = false;
    this.selectedVoucher = null;
  }
}
