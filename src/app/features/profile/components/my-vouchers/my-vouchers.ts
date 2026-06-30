import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-vouchers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-vouchers.html'
})
export class MyVouchers implements OnInit {
  activeTab = 'ACTIVE'; // 'ACTIVE', 'USED', 'EXPIRED'
  
  myVouchers = [
    {
      id: 1,
      code: 'SUMMER30',
      title: 'Mùa hè rực rỡ - Giảm tới 30%',
      discountValue: 30,
      discountType: 'PERCENTAGE',
      validUntil: '2026-08-31T23:59:59',
      status: 'ACTIVE'
    },
    {
      id: 2,
      code: 'FLASHSALE',
      title: 'Tuần lễ vàng - Flash Sale',
      discountValue: 500000,
      discountType: 'FIXED_AMOUNT',
      validUntil: '2026-07-07T23:59:59',
      status: 'USED'
    },
    {
      id: 3,
      code: 'WELCOME',
      title: 'Voucher Chào mừng',
      discountValue: 100000,
      discountType: 'FIXED_AMOUNT',
      validUntil: '2026-01-01T23:59:59',
      status: 'EXPIRED'
    }
  ];

  get filteredVouchers() {
    return this.myVouchers.filter(v => v.status === this.activeTab);
  }

  ngOnInit() {
    // API load here later
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
