import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  AmenityCategory,
  AmenityItem,
  AmenityPreset,
  AmenityResponse
} from '../../../../../../core/models/amenitie/amenities.model';
import { AmenityService } from '../../../../../../core/services/amenity/amenities.service';


@Component({
  selector: 'app-property-amenities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-amenities.html',
  styleUrl: './property-amenities.css',
})
export class PropertyAmenities implements OnInit {
  private route = inject(ActivatedRoute);
  private amenityService = inject(AmenityService);

  homestayId: string | null = null;

  isLoading = signal(false);
  isSaving = signal(false);
  isDirty = signal(false);
  showSavedToast = signal(false);

  searchText = signal('');
  activeCategory = signal<string>('POPULAR');

  selectedAmenityIds = signal<Set<number>>(new Set());

  categories: AmenityCategory[] = [
    {
      key: 'POPULAR',
      title: 'Phổ biến nhất',
      description: 'Những tiện nghi khách thường lọc khi tìm chỗ ở.',
      icon: 'star'
    },
    {
      key: 'Connectivity',
      title: 'Kết nối',
      description: 'Wifi, internet tốc độ cao và các tiện ích kết nối.',
      icon: 'wifi'
    },
    {
      key: 'Room',
      title: 'Trong phòng',
      description: 'Các tiện nghi có sẵn bên trong phòng hoặc không gian nghỉ.',
      icon: 'bed'
    },
    {
      key: 'Entertainment',
      title: 'Giải trí',
      description: 'TV, Netflix, âm thanh, trò chơi và các tiện ích giải trí.',
      icon: 'tv'
    },
    {
      key: 'Facilities',
      title: 'Cơ sở vật chất',
      description: 'Bãi đỗ xe, hồ bơi, máy giặt, điều hòa và tiện ích chung.',
      icon: 'apartment'
    },
    {
      key: 'Dining',
      title: 'Bếp & ăn uống',
      description: 'Bếp, BBQ, bàn ăn, dụng cụ nấu nướng và khu vực ăn uống.',
      icon: 'restaurant'
    },
    {
      key: 'Outdoor',
      title: 'Ngoài trời',
      description: 'Sân vườn, ban công, sân hiên và khu vực thư giãn ngoài trời.',
      icon: 'yard'
    },
    {
      key: 'View',
      title: 'Tầm nhìn',
      description: 'View biển, view núi, view thành phố hoặc view sân vườn.',
      icon: 'landscape'
    },
    {
      key: 'Policies',
      title: 'Chính sách',
      description: 'Hút thuốc, thú cưng, tiệc tùng và các quy định lưu trú.',
      icon: 'rule'
    },
    {
      key: 'Service',
      title: 'Dịch vụ',
      description: 'Dọn phòng, lễ tân, hỗ trợ khách và các dịch vụ đi kèm.',
      icon: 'room_service'
    },
    {
      key: 'Transport',
      title: 'Di chuyển',
      description: 'Đưa đón sân bay, thuê xe, xe máy và hỗ trợ đi lại.',
      icon: 'airport_shuttle'
    }
  ];

  amenities: AmenityItem[] = [];

  presets: AmenityPreset[] = [
    {
      key: 'ESSENTIAL',
      title: 'Cơ bản cần có',
      description: 'Wifi, điều hòa, nước nóng, TV, bãi đỗ xe.',
      icon: 'verified',
      amenityIds: [1, 10, 50, 53, 55, 71]
    },
    {
      key: 'FAMILY_READY',
      title: 'Phù hợp gia đình',
      description: 'Bếp, máy giặt, sân vườn, tiện ích cho trẻ em.',
      icon: 'family_restroom',
      amenityIds: [1, 20, 22, 40, 41, 42, 43, 50, 51, 55]
    },
    {
      key: 'WORKATION',
      title: 'Làm việc từ xa',
      description: 'Wifi mạnh, bàn làm việc, ổ cắm, máy in.',
      icon: 'work',
      amenityIds: [1, 2, 3, 4, 5, 24, 25, 50]
    },
    {
      key: 'VILLA_RESORT',
      title: 'Villa / nghỉ dưỡng',
      description: 'Hồ bơi, sân vườn, BBQ, ban công, view đẹp.',
      icon: 'villa',
      amenityIds: [1, 28, 30, 31, 32, 33, 35, 36, 38, 50]
    }
  ];

  filteredAmenities = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const active = this.activeCategory();

    return this.amenities.filter(item => {
      const matchCategory =
        active === 'POPULAR'
          ? item.popular
          : item.category === active;

      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query);

      return matchCategory && matchSearch;
    });
  });

  selectedAmenities = computed(() => {
    const selected = this.selectedAmenityIds();

    return this.amenities.filter(item => selected.has(item.id));
  });

  ngOnInit(): void {
    const paramMap$ = this.route.parent?.paramMap ?? this.route.paramMap;

    paramMap$.subscribe(params => {
      this.homestayId = params.get('id') || params.get('homestayId');

      if (this.homestayId) {
        this.loadAmenities(Number(this.homestayId));
      }
    });
  }

  private loadAmenities(homestayId: number): void {
    this.isLoading.set(true);

    this.amenityService.getAllAmenities().subscribe({
      next: amenityRes => {
        const amenities = amenityRes.data || [];
        console.log(amenities)

        this.amenities = amenities.map(item => this.mapAmenityResponse(item));

        this.amenityService.getHomestayAmenityIds(homestayId).subscribe({
          next: selectedRes => {
            const selectedIds = selectedRes.data || [];

            this.selectedAmenityIds.set(new Set(selectedIds));
            this.isDirty.set(false);
            this.isLoading.set(false);
          },
          error: err => {
            console.error('Load selected homestay amenities failed:', err);

            this.selectedAmenityIds.set(new Set());
            this.isDirty.set(false);
            this.isLoading.set(false);
          }
        });
      },
      error: err => {
        console.error('Load amenities failed:', err);

        this.amenities = [];
        this.selectedAmenityIds.set(new Set());
        this.isDirty.set(false);
        this.isLoading.set(false);
      }
    });
  }

  private mapAmenityResponse(item: AmenityResponse): AmenityItem {
    return {
      id: item.id,
      name: item.name,
      icon: item.iconName || 'widgets',
      category: item.groupName?.trim() || 'Room',
      popular: this.isPopularAmenity(item.id, item.name)
    };
  }

  private isPopularAmenity(id: number, name: string): boolean {
    const popularIds = new Set([
      1, 2, 3,
      10, 11,
      20, 22, 28,
      30, 32, 33,
      40,
      50, 51, 53, 55,
      71
    ]);

    if (popularIds.has(id)) {
      return true;
    }

    const normalizedName = name.toLowerCase();

    return [
      'wifi',
      'bãi đỗ',
      'hồ bơi',
      'bếp',
      'điều hòa',
      'máy giặt',
      'tv',
      'nước nóng',
      'bbq'
    ].some(keyword => normalizedName.includes(keyword));
  }

  setActiveCategory(categoryKey: string): void {
    this.activeCategory.set(categoryKey);
  }

  onSearchChange(value: string): void {
    this.searchText.set(value);
  }

  isSelected(amenityId: number): boolean {
    return this.selectedAmenityIds().has(amenityId);
  }

  toggleAmenity(amenityId: number): void {
    const next = new Set(this.selectedAmenityIds());

    if (next.has(amenityId)) {
      next.delete(amenityId);
    } else {
      next.add(amenityId);
    }

    this.selectedAmenityIds.set(next);
    this.markDirty();
  }

  applyPreset(preset: AmenityPreset): void {
    const availableIds = new Set(this.amenities.map(item => item.id));
    const next = new Set(this.selectedAmenityIds());

    preset.amenityIds.forEach(id => {
      if (availableIds.has(id)) {
        next.add(id);
      }
    });

    this.selectedAmenityIds.set(next);
    this.markDirty();
  }

  selectAllInCurrentCategory(): void {
    const next = new Set(this.selectedAmenityIds());

    this.filteredAmenities().forEach(item => {
      next.add(item.id);
    });

    this.selectedAmenityIds.set(next);
    this.markDirty();
  }

  clearCurrentCategory(): void {
    const next = new Set(this.selectedAmenityIds());

    this.filteredAmenities().forEach(item => {
      next.delete(item.id);
    });

    this.selectedAmenityIds.set(next);
    this.markDirty();
  }

  clearAll(): void {
    const ok = confirm('Bạn có chắc muốn bỏ chọn toàn bộ tiện nghi không?');

    if (!ok) return;

    this.selectedAmenityIds.set(new Set());
    this.markDirty();
  }

  removeSelectedAmenity(amenityId: number): void {
    const next = new Set(this.selectedAmenityIds());
    next.delete(amenityId);

    this.selectedAmenityIds.set(next);
    this.markDirty();
  }

  getSelectedCountByCategory(categoryKey: string): number {
    const selected = this.selectedAmenityIds();

    if (categoryKey === 'POPULAR') {
      return this.amenities.filter(item => item.popular && selected.has(item.id)).length;
    }

    return this.amenities.filter(item => item.category === categoryKey && selected.has(item.id)).length;
  }

  markDirty(): void {
    this.isDirty.set(true);
  }

  saveChanges(): void {
    if (!this.homestayId) {
      alert('Không tìm thấy ID chỗ nghỉ.');
      return;
    }

    const homestayId = Number(this.homestayId);

    if (Number.isNaN(homestayId)) {
      alert('ID chỗ nghỉ không hợp lệ.');
      return;
    }

    this.isSaving.set(true);

    const amenityIds = Array.from(this.selectedAmenityIds());

    this.amenityService.updateHomestayAmenities(homestayId, amenityIds).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isDirty.set(false);
        this.showSuccessToast();
      },
      error: err => {
        console.error('Save homestay amenities failed:', err);

        this.isSaving.set(false);
        alert('Lưu tiện nghi thất bại. Vui lòng thử lại.');
      }
    });
  }

  private showSuccessToast(): void {
    this.showSavedToast.set(true);

    setTimeout(() => {
      this.showSavedToast.set(false);
    }, 2500);
  }
}