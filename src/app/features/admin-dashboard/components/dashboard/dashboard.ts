import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Activity {
  id: string;
  title: string;
  time: string;
  type: 'BOOKING' | 'USER' | 'FINANCE' | 'SYSTEM';
  status: 'SUCCESS' | 'WARNING' | 'INFO';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  
  // Dữ liệu biểu đồ doanh thu giả lập (7 ngày)
  revenueData = [
    { day: 'T2', value: 45, label: '45M' },
    { day: 'T3', value: 60, label: '60M' },
    { day: 'T4', value: 35, label: '35M' },
    { day: 'T5', value: 85, label: '85M', isToday: true },
    { day: 'T6', value: 0, label: '0M' },
    { day: 'T7', value: 0, label: '0M' },
    { day: 'CN', value: 0, label: '0M' }
  ];

  recentActivities: Activity[] = [
    { id: '1', title: 'Host "Đà Lạt Mộng Mơ" vừa yêu cầu rút 45.000.000 VND', time: '10 phút trước', type: 'FINANCE', status: 'WARNING' },
    { id: '2', title: 'Booking #TXN-9A8B7C hoàn tất thanh toán (VNPAY)', time: '25 phút trước', type: 'BOOKING', status: 'SUCCESS' },
    { id: '3', title: 'User mới đăng ký: Trần Thị Thu Thảo', time: '1 giờ trước', type: 'USER', status: 'INFO' },
    { id: '4', title: 'Hệ thống tự động nhả 12 phòng do quá hạn', time: '2 giờ trước', type: 'SYSTEM', status: 'INFO' },
    { id: '5', title: 'Booking #TXN-1B2A3C bị hủy bởi Khách hàng', time: '3 giờ trước', type: 'BOOKING', status: 'WARNING' }
  ];

  getActivityIcon(type: string): string {
    const icons: any = { 'BOOKING': 'receipt_long', 'USER': 'person_add', 'FINANCE': 'account_balance', 'SYSTEM': 'memory' };
    return icons[type] || 'info';
  }

  getActivityColor(status: string): string {
    const colors: any = {
      'SUCCESS': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'WARNING': 'bg-amber-50 text-amber-600 border-amber-100',
      'INFO': 'bg-blue-50 text-blue-600 border-blue-100'
    };
    return colors[status];
  }
}