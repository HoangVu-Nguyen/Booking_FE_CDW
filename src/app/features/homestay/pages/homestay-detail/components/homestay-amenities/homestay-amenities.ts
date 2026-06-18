import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';

export interface HomestayAmenityView {
  id: number;
  name: string;
  iconName: string;
  groupName?: string;
}

@Component({
  selector: 'app-homestay-amenities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homestay-amenities.html',
  styleUrl: './homestay-amenities.css',
})
export class HomestayAmenities {
  constructor(private homestayService: HomestayService) {}

  isModalOpen = signal(false);

  amenities = computed<HomestayAmenityView[]>(() => {
    return this.homestayService.currentHomestay()?.amenities || [];
  });

  previewAmenities = computed(() => {
    return this.amenities().slice(0, 6);
  });

  groupedAmenities = computed(() => {
    const groups = new Map<string, HomestayAmenityView[]>();

    this.amenities().forEach(item => {
      const groupName = item.groupName || 'Other';

      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }

      groups.get(groupName)!.push(item);
    });

    return Array.from(groups.entries()).map(([groupName, items]) => ({
      groupName,
      title: this.getGroupTitle(groupName),
      icon: this.getGroupIcon(groupName),
      items
    }));
  });

  openModal(): void {
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    document.body.style.overflow = '';
  }

  getGroupTitle(groupName: string): string {
    const map: Record<string, string> = {
      Connectivity: 'Kết nối',
      Room: 'Trong phòng',
      Entertainment: 'Giải trí',
      Facilities: 'Cơ sở vật chất',
      Dining: 'Bếp & ăn uống',
      Outdoor: 'Ngoài trời',
      View: 'Tầm nhìn',
      Policies: 'Chính sách',
      Service: 'Dịch vụ',
      Transport: 'Di chuyển',
      Other: 'Tiện nghi khác'
    };

    return map[groupName] || groupName;
  }

  getGroupIcon(groupName: string): string {
    const map: Record<string, string> = {
      Connectivity: 'wifi',
      Room: 'bed',
      Entertainment: 'tv',
      Facilities: 'apartment',
      Dining: 'restaurant',
      Outdoor: 'yard',
      View: 'landscape',
      Policies: 'rule',
      Service: 'room_service',
      Transport: 'airport_shuttle',
      Other: 'widgets'
    };

    return map[groupName] || 'widgets';
  }
}