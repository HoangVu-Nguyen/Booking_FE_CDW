import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface RoomAmenityTab {
  label: string;
  description: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-room-amenities',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './room-amenities.html',
  styleUrl: './room-amenities.css',
})
export class RoomAmenities {
  tabs: RoomAmenityTab[] = [
    {
      label: 'Tiện nghi phòng',
      description: 'View biển, giường King, phòng tắm riêng, ban công...',
      icon: 'hotel_class',
      path: 'highlights'
    },
    {
      label: 'Quyền lợi gói giá',
      description: 'Huỷ miễn phí, không hoàn tiền, ăn sáng, thanh toán tại chỗ...',
      icon: 'payments',
      path: 'rate-plan-benefits'
    }
  ];
}