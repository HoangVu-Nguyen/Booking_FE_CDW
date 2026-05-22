import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DRAFT';
  stats: { rating: number; reviews: number; occupancy: number; revenueThisMonth: number };
  image: string;
}

@Component({
  selector: 'app-host-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.html'
})
export class Portfolio {
  
  properties: Property[] = [
    {
      id: 'PRP-001',
      name: 'The Forest Call - Căn Penthouse Kính Tầng 24',
      location: 'Quận 2, TP. Hồ Chí Minh',
      type: 'Penthouse',
      price: 4500000,
      currency: 'VND',
      status: 'ACTIVE',
      stats: { rating: 4.95, reviews: 128, occupancy: 92, revenueThisMonth: 125000000 },
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 'PRP-002',
      name: 'Sapa Cloud Hunting Wooden Villa',
      location: 'Thị xã Sapa, Lào Cai',
      type: 'Villa Toàn căn',
      price: 8500000,
      currency: 'VND',
      status: 'ACTIVE',
      stats: { rating: 4.8, reviews: 56, occupancy: 85, revenueThisMonth: 210000000 },
      image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2128&auto=format&fit=crop'
    },
    {
      id: 'PRP-003',
      name: 'Đà Lạt Mộng Mơ - Studio Retro Xưa',
      location: 'Phường 10, Đà Lạt',
      type: 'Studio',
      price: 1200000,
      currency: 'VND',
      status: 'MAINTENANCE',
      stats: { rating: 4.7, reviews: 210, occupancy: 0, revenueThisMonth: 0 },
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 'PRP-004',
      name: 'Hội An Ancient Heritage House',
      location: 'Phố Cổ Hội An, Quảng Nam',
      type: 'Nhà nguyên căn',
      price: 3200000,
      currency: 'VND',
      status: 'DRAFT',
      stats: { rating: 0, reviews: 0, occupancy: 0, revenueThisMonth: 0 },
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop'
    }
  ];

  getStatusConfig(status: string) {
    const configs: any = {
      'ACTIVE': { bg: 'bg-emerald-500/90', text: 'text-white', icon: 'check_circle', label: 'Đang hoạt động' },
      'MAINTENANCE': { bg: 'bg-amber-500/90', text: 'text-white', icon: 'build', label: 'Bảo trì' },
      'DRAFT': { bg: 'bg-stone-500/90', text: 'text-white', icon: 'edit_document', label: 'Bản nháp' }
    };
    return configs[status];
  }
}