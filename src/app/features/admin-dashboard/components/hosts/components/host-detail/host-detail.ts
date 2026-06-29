import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Thêm Location để quay lại
import { Router, ActivatedRoute } from '@angular/router';

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  image: string; // Thêm ảnh thumbnail
  status: 'ACTIVE' | 'PENDING_DOCS' | 'SUSPENDED';
  metrics: { bookings: number; revenue: number; rating: number };
}

@Component({
  selector: 'app-admin-host-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './host-detail.html'
})
export class HostDetail implements OnInit {
  private location = inject(Location);
  
  activeTab: 'OVERVIEW' | 'PROPERTIES' | 'KYC_DOCS' | 'AUDIT_LOG' = 'OVERVIEW';

  host = {
    id: 'HST-88291A',
    user: { 
      name: 'Nguyễn Bùi Hoàng Vũ', 
      avatar: 'https://ui-avatars.com/api/?name=Hoang+Vu&bg=173124&color=fff', 
      email: 'hoangvu.dev@clyvasync.com', 
      phone: '0987 654 321',
      address: 'Phường 8, Đà Lạt, Lâm Đồng'
    },
    joinDate: '2026-01-15',
    status: 'ACTIVE', 
    walletBalance: 42000000,
    totalRevenue: 850000000,
    metrics: { 
      totalBookings: 342, 
      cancellationRate: 1.2, // Tỷ lệ hủy đơn
      responseRate: 98,      // Tỷ lệ phản hồi (%)
      avgRating: 4.88,       // Điểm đánh giá trung bình
      reviewsCount: 156
    },
    kyc: {
      identity: 'VERIFIED',
      idNumber: '079204001234',
      bankInfo: { bankName: 'Vietcombank', accountNo: '1012345678', ownerName: 'NGUYEN BUI HOANG VU' }
    }
  };

  properties: Property[] = [
    {
      id: 'HOM-1102',
      name: 'Clyvasync Villa Da Lat',
      type: 'Biệt thự',
      location: 'Phường 8, Đà Lạt',
      image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=300&q=80',
      status: 'ACTIVE',
      metrics: { bookings: 124, revenue: 350000000, rating: 4.9 }
    },
    {
      id: 'HOM-1103',
      name: 'Clyvasync Studio Center',
      type: 'Căn hộ',
      location: 'Quận 1, TP.HCM',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&q=80',
      status: 'PENDING_DOCS',
      metrics: { bookings: 0, revenue: 0, rating: 0 }
    }
  ];

  auditLogs = [
    { time: '2026-06-29 08:30', action: 'Rút tiền', desc: 'Rút 15.000.000đ về Vietcombank', status: 'SUCCESS' },
    { time: '2026-06-25 14:15', action: 'Cập nhật', desc: 'Đăng tải Sổ đỏ cho căn HOM-1103', status: 'INFO' },
    { time: '2026-06-20 09:00', action: 'Hủy đơn', desc: 'Hủy đơn BK-9921 của khách hàng', status: 'WARNING' }
  ];

  ngOnInit() {
    // Logic lấy ID từ URL (đã hướng dẫn ở bước trước)
  }

  goBack() {
    this.location.back(); // Quay lại trang trước đó mượt mà
  }

  suspendHost() {
    if(confirm('CẢNH BÁO MỨC ĐỎ: Khóa chủ nhà này sẽ gỡ toàn bộ chỗ nghỉ khỏi hệ thống. Bạn chắc chắn?')) {
      this.host.status = 'SUSPENDED';
    }
  }

  togglePropertyStatus(prop: Property) {
    const action = prop.status === 'ACTIVE' ? 'tạm dừng' : 'kích hoạt lại';
    if(confirm(`Bạn muốn ${action} căn ${prop.name}?`)) {
      prop.status = prop.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    }
  }

  getPropertyStatusConfig(status: string) {
    const map: any = {
      'ACTIVE': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Hoạt động' },
      'PENDING_DOCS': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Chờ duyệt Sổ' },
      'SUSPENDED': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Đình chỉ' }
    };
    return map[status];
  }
}