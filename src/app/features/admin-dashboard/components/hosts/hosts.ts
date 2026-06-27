import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HostMetric {
  properties: number;
  pendingProperties: number;
  totalBookings: number;
  rating: number;
  totalRevenue: number;
}

interface Verification {
  identity: boolean; // CMND/CCCD
  businessLicense: boolean; // Giấy phép kinh doanh (Tùy chọn)
  bankAccount: boolean; // Tài khoản ngân hàng
}

interface HostProfile {
  id: string;
  user: { name: string; avatar: string; email: string; phone: string };
  joinDate: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  verification: Verification;
  metrics: HostMetric;
}

@Component({
  selector: 'app-admin-hosts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hosts.html'
})
export class Hosts {
  hosts: HostProfile[] = [
    {
      id: 'HST-88291A',
      user: { name: 'Nguyễn Bùi Hoàng Vũ', avatar: 'https://ui-avatars.com/api/?name=Hoang+Vu&bg=173124&color=fff', email: 'hoangvu.dev@clyvasync.com', phone: '0987 654 321' },
      joinDate: '2026-01-15T08:00:00',
      status: 'ACTIVE',
      verification: { identity: true, businessLicense: true, bankAccount: true },
      // Host này đã KYC xong, nhưng đang có 1 căn Homestay mới up sổ đỏ chờ duyệt
      metrics: { properties: 5, pendingProperties: 1, totalBookings: 342, rating: 4.9, totalRevenue: 850000000 }
    },
    {
      id: 'HST-2291B4',
      user: { name: 'Trần Thị Thu Thảo', avatar: 'https://ui-avatars.com/api/?name=Thu+Thao&bg=f5f5f4&color=292524', email: 'thuthao.homestay@gmail.com', phone: '0912 345 678' },
      joinDate: '2026-05-20T14:30:00',
      status: 'PENDING',
      verification: { identity: true, businessLicense: false, bankAccount: false },
      metrics: { properties: 1, pendingProperties: 0, totalBookings: 0, rating: 0, totalRevenue: 0 }
    }
    // ... (Giữ nguyên các data khác của ông)
  ];

  getStatusConfig(status: string) {
    const configs: any = {
      'ACTIVE': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', label: 'Đang hoạt động', dot: 'bg-emerald-500' },
      'PENDING': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60', label: 'Chờ duyệt KYC', dot: 'bg-amber-500 animate-pulse' },
      'SUSPENDED': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60', label: 'Đình chỉ', dot: 'bg-rose-500' }
    };
    return configs[status];
  }

  getVerificationProgress(ver: Verification): number {
    let count = 0;
    if (ver.identity) count++;
    if (ver.businessLicense) count++;
    if (ver.bankAccount) count++;
    return (count / 3) * 100;
  }
  reviewKyc(hostId: string) {
    console.log('Chuyển sang trang duyệt KYC cá nhân cho Host:', hostId);
    // this.router.navigate(['/admin/hosts/kyc', hostId]);
  }

  reviewProperties(hostId: string) {
    console.log('Chuyển sang trang xem danh sách Sổ đỏ/Hợp đồng của Host:', hostId);
    // this.router.navigate(['/admin/hosts/properties', hostId], { queryParams: { status: 'PENDING_VERIFICATION' }});
  }
}