import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AmenityCategory, AmenityItem, AmenityPreset } from '../../../../../../core/models/amenitie/amenities.model';
@Component({
  selector: 'app-property-amenities',
  imports: [CommonModule,FormsModule],
  templateUrl: './property-amenities.html',
  styleUrl: './property-amenities.css',
})
export class PropertyAmenities {
  private route = inject(ActivatedRoute);

  homestayId: string | null = null;

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
      key: 'INTERNET_WORK',
      title: 'Internet & làm việc',
      description: 'Phù hợp khách đi công tác, học tập hoặc làm việc từ xa.',
      icon: 'wifi'
    },
    {
      key: 'PARKING_TRANSPORT',
      title: 'Đỗ xe & di chuyển',
      description: 'Các tiện ích liên quan đến xe, đưa đón và đi lại.',
      icon: 'local_parking'
    },
    {
      key: 'KITCHEN_DINING',
      title: 'Bếp & ăn uống',
      description: 'Tiện nghi nấu nướng, ăn uống, BBQ và sinh hoạt gia đình.',
      icon: 'restaurant'
    },
    {
      key: 'POOL_OUTDOOR',
      title: 'Hồ bơi & ngoài trời',
      description: 'Không gian thư giãn, sân vườn, ban công, view và BBQ.',
      icon: 'pool'
    },
    {
      key: 'FAMILY',
      title: 'Gia đình & trẻ em',
      description: 'Dành cho nhóm gia đình, trẻ nhỏ và người đi theo đoàn.',
      icon: 'family_restroom'
    },
    {
      key: 'COMFORT',
      title: 'Tiện nghi sinh hoạt',
      description: 'Các tiện nghi cơ bản giúp khách ở thoải mái hơn.',
      icon: 'home'
    },
    {
      key: 'SAFETY',
      title: 'An toàn & hỗ trợ',
      description: 'Thiết bị an toàn, hỗ trợ khẩn cấp và tiện ích bảo vệ.',
      icon: 'health_and_safety'
    }
  ];

  amenities: AmenityItem[] = [
    // POPULAR / INTERNET
    { id: 1, name: 'Wifi miễn phí', icon: 'wifi', category: 'INTERNET_WORK', popular: true },
    { id: 2, name: 'Wifi tốc độ cao', icon: 'network_wifi', category: 'INTERNET_WORK', popular: true },
    { id: 3, name: 'Không gian làm việc', icon: 'desk', category: 'INTERNET_WORK', popular: true },
    { id: 4, name: 'Ổ cắm gần bàn làm việc', icon: 'power', category: 'INTERNET_WORK' },
    { id: 5, name: 'Máy in', icon: 'print', category: 'INTERNET_WORK' },
    { id: 6, name: 'Phòng họp nhỏ', icon: 'meeting_room', category: 'INTERNET_WORK' },

    // PARKING
    { id: 10, name: 'Bãi đỗ xe miễn phí', icon: 'local_parking', category: 'PARKING_TRANSPORT', popular: true },
    { id: 11, name: 'Đỗ xe trong khuôn viên', icon: 'garage', category: 'PARKING_TRANSPORT', popular: true },
    { id: 12, name: 'Đỗ xe ngoài đường', icon: 'directions_car', category: 'PARKING_TRANSPORT' },
    { id: 13, name: 'Sạc xe điện', icon: 'ev_station', category: 'PARKING_TRANSPORT' },
    { id: 14, name: 'Đưa đón sân bay', icon: 'airport_shuttle', category: 'PARKING_TRANSPORT' },
    { id: 15, name: 'Cho thuê xe máy', icon: 'two_wheeler', category: 'PARKING_TRANSPORT' },

    // KITCHEN
    { id: 20, name: 'Bếp riêng', icon: 'kitchen', category: 'KITCHEN_DINING', popular: true },
    { id: 21, name: 'Bếp chung', icon: 'countertops', category: 'KITCHEN_DINING' },
    { id: 22, name: 'Tủ lạnh', icon: 'kitchen', category: 'KITCHEN_DINING', popular: true },
    { id: 23, name: 'Lò vi sóng', icon: 'microwave', category: 'KITCHEN_DINING' },
    { id: 24, name: 'Ấm đun nước', icon: 'coffee_maker', category: 'KITCHEN_DINING' },
    { id: 25, name: 'Máy pha cà phê', icon: 'coffee', category: 'KITCHEN_DINING' },
    { id: 26, name: 'Bàn ăn', icon: 'table_restaurant', category: 'KITCHEN_DINING' },
    { id: 27, name: 'Dụng cụ nấu ăn', icon: 'skillet', category: 'KITCHEN_DINING' },
    { id: 28, name: 'BBQ', icon: 'outdoor_grill', category: 'KITCHEN_DINING', popular: true },

    // POOL OUTDOOR
    { id: 30, name: 'Hồ bơi', icon: 'pool', category: 'POOL_OUTDOOR', popular: true },
    { id: 31, name: 'Hồ bơi riêng', icon: 'pool', category: 'POOL_OUTDOOR' },
    { id: 32, name: 'Sân vườn', icon: 'yard', category: 'POOL_OUTDOOR', popular: true },
    { id: 33, name: 'Ban công', icon: 'balcony', category: 'POOL_OUTDOOR', popular: true },
    { id: 34, name: 'Sân hiên', icon: 'deck', category: 'POOL_OUTDOOR' },
    { id: 35, name: 'View núi', icon: 'landscape', category: 'POOL_OUTDOOR' },
    { id: 36, name: 'View biển', icon: 'beach_access', category: 'POOL_OUTDOOR' },
    { id: 37, name: 'Khu vực picnic', icon: 'park', category: 'POOL_OUTDOOR' },
    { id: 38, name: 'Bàn ghế ngoài trời', icon: 'deck', category: 'POOL_OUTDOOR' },

    // FAMILY
    { id: 40, name: 'Phù hợp gia đình', icon: 'family_restroom', category: 'FAMILY', popular: true },
    { id: 41, name: 'Cũi trẻ em', icon: 'crib', category: 'FAMILY' },
    { id: 42, name: 'Ghế ăn trẻ em', icon: 'chair_alt', category: 'FAMILY' },
    { id: 43, name: 'Khu vui chơi trẻ em', icon: 'toys', category: 'FAMILY' },
    { id: 44, name: 'Cầu thang có chắn', icon: 'stairs', category: 'FAMILY' },
    { id: 45, name: 'Sách và đồ chơi trẻ em', icon: 'menu_book', category: 'FAMILY' },

    // COMFORT
    { id: 50, name: 'Điều hòa', icon: 'ac_unit', category: 'COMFORT', popular: true },
    { id: 51, name: 'Máy giặt', icon: 'local_laundry_service', category: 'COMFORT', popular: true },
    { id: 52, name: 'Máy sấy quần áo', icon: 'dry_cleaning', category: 'COMFORT' },
    { id: 53, name: 'TV', icon: 'tv', category: 'COMFORT', popular: true },
    { id: 54, name: 'Netflix / Smart TV', icon: 'smart_display', category: 'COMFORT' },
    { id: 55, name: 'Nước nóng', icon: 'water_heater', category: 'COMFORT', popular: true },
    { id: 56, name: 'Máy sấy tóc', icon: 'air', category: 'COMFORT' },
    { id: 57, name: 'Bàn ủi', icon: 'iron', category: 'COMFORT' },
    { id: 58, name: 'Tủ quần áo', icon: 'checkroom', category: 'COMFORT' },
    { id: 59, name: 'Dọn phòng', icon: 'cleaning_services', category: 'COMFORT' },

    // SAFETY
    { id: 70, name: 'Camera an ninh khu chung', icon: 'videocam', category: 'SAFETY' },
    { id: 71, name: 'Bình chữa cháy', icon: 'fire_extinguisher', category: 'SAFETY', popular: true },
    { id: 72, name: 'Máy báo khói', icon: 'detector_smoke', category: 'SAFETY' },
    { id: 73, name: 'Bộ sơ cứu', icon: 'medical_services', category: 'SAFETY' },
    { id: 74, name: 'Khóa thông minh', icon: 'lock', category: 'SAFETY' },
    { id: 75, name: 'Bảo vệ 24/7', icon: 'security', category: 'SAFETY' }
  ];

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
        this.loadAmenities(this.homestayId);
      }
    });
  }

  private loadAmenities(homestayId: string): void {
    console.log('Load amenities for homestay:', homestayId);

    // Hardcode demo: sau này thay bằng API.
    this.selectedAmenityIds.set(new Set([1, 10, 20, 50, 53, 55]));
    this.isDirty.set(false);
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
    const next = new Set(this.selectedAmenityIds());

    preset.amenityIds.forEach(id => {
      next.add(id);
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

    this.isSaving.set(true);

    const payload = {
      homestayId: Number(this.homestayId),
      amenityIds: Array.from(this.selectedAmenityIds())
    };

    console.log('Payload save property amenities:', payload);

    // Sau này gọi API:
    // this.homestayService.updateAmenities(payload).subscribe(...)

    setTimeout(() => {
      this.isSaving.set(false);
      this.isDirty.set(false);
      this.showSuccessToast();
    }, 800);
  }

  private showSuccessToast(): void {
    this.showSavedToast.set(true);

    setTimeout(() => {
      this.showSavedToast.set(false);
    }, 2500);
  }
}
