import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RoomAmenityHighlightRequest } from '../../../../../../../../core/models/amenitie/amenities.model';
import { AmenityResponse } from '../../../../../../../../core/models/response/homestay.response';
import { RoomDisplayResponse } from '../../../../../../../../core/models/response/room.response';
import { AmenityService } from '../../../../../../../../core/services/amenity/amenities.service';
import { HomestayService } from '../../../../../../../../core/services/homestay/homestay.service';




interface RoomOption {
  id: number;
  name: string;
  type: string;
  maxGuests: number;
  imageUrl: string;
  area?: string | number | null;
  bedCount?: number;
}

interface RoomAmenityItem {
  id: number;
  name: string;
  iconName: string;
  groupName: string;
  placeholder?: string;
  popular?: boolean;
}

interface SelectedRoomAmenity {
  amenityId: number;
  displayValue: string | null;
}

@Component({
  selector: 'app-room-amenity-highlights',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-amenity-highlights.html',
  styleUrl: './room-amenity-highlights.css',
})
export class RoomAmenityHighlights implements OnInit {
  private route = inject(ActivatedRoute);
  private amenityService = inject(AmenityService);
  private homestayService = inject(HomestayService);

  homestayId: string | null = null;

  isLoadingRooms = signal(false);
  isLoadingAmenities = signal(false);
  isLoadingHighlights = signal(false);
  isSaving = signal(false);
  isDirty = signal(false);

  searchText = signal('');
  activeGroup = signal('POPULAR');

  selectedRoomId = signal<number | null>(null);

  rooms = signal<RoomOption[]>([]);
  amenities = signal<RoomAmenityItem[]>([]);

  selectedByRoom = signal<Record<number, SelectedRoomAmenity[]>>({});

  groups = [
    {
      key: 'POPULAR',
      title: 'Nổi bật',
      icon: 'star',
      description: 'Những tiện nghi nên hiển thị lớn ở card phòng.'
    },
    {
      key: 'Connectivity',
      title: 'Kết nối',
      icon: 'wifi',
      description: 'Wifi, internet tốc độ cao và các tiện ích kết nối.'
    },
    {
      key: 'Room',
      title: 'Trong phòng',
      icon: 'bed',
      description: 'Giường, phòng tắm, điều hòa và tiện nghi trong phòng.'
    },
    {
      key: 'Entertainment',
      title: 'Giải trí',
      icon: 'tv',
      description: 'TV, Netflix, âm thanh và tiện ích giải trí.'
    },
    {
      key: 'Facilities',
      title: 'Tiện nghi',
      icon: 'chair',
      description: 'Điều hòa, minibar, tủ quần áo và tiện nghi khác.'
    },
    {
      key: 'View',
      title: 'Tầm nhìn',
      icon: 'landscape',
      description: 'View biển, view núi, view sân vườn hoặc thành phố.'
    },
    {
      key: 'Dining',
      title: 'Ăn uống',
      icon: 'restaurant',
      description: 'Bữa sáng, minibar, trà cà phê hoặc tiện ích ăn uống.'
    },
    {
      key: 'Service',
      title: 'Dịch vụ',
      icon: 'room_service',
      description: 'Dọn phòng, lễ tân, hỗ trợ khách và dịch vụ đi kèm.'
    }
  ];

  selectedRoom = computed(() => {
    const rooms = this.rooms();
    const selectedId = this.selectedRoomId();

    return rooms.find(room => room.id === selectedId) || rooms[0] || null;
  });

  currentSelected = computed(() => {
    const roomId = this.selectedRoomId();

    if (!roomId) return [];

    return this.selectedByRoom()[roomId] || [];
  });

  currentSelectedIds = computed(() => {
    return new Set(this.currentSelected().map(item => item.amenityId));
  });

  selectedAmenityViews = computed(() => {
    const amenities = this.amenities();

    return this.currentSelected()
      .map(selected => {
        const amenity = amenities.find(item => item.id === selected.amenityId);

        if (!amenity) return null;

        return {
          ...amenity,
          displayValue: selected.displayValue
        };
      })
      .filter(Boolean) as Array<RoomAmenityItem & { displayValue: string | null }>;
  });

  filteredAmenities = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const activeGroup = this.activeGroup();
    const amenities = this.amenities();

    return amenities.filter(item => {
      const matchGroup =
        activeGroup === 'POPULAR'
          ? item.popular
          : item.groupName === activeGroup;

      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.groupName.toLowerCase().includes(query);

      return matchGroup && matchSearch;
    });
  });

  payloadPreview = computed(() => {
    return {
      roomId: this.selectedRoomId(),
      highlights: this.currentSelected().map(item => ({
        amenityId: item.amenityId,
        displayValue: item.displayValue
      }))
    };
  });

  ngOnInit(): void {
    const paramMap$ =
      this.route.parent?.parent?.paramMap ??
      this.route.parent?.paramMap ??
      this.route.paramMap;

    paramMap$.subscribe(params => {
      this.homestayId = params.get('id') || params.get('homestayId');

      if (!this.homestayId) {
        console.warn('Không tìm thấy homestayId trên route');
        return;
      }

      this.loadAmenities();
      this.loadRooms();
    });
  }

  private loadRooms(): void {
    if (!this.homestayId) return;

    this.isLoadingRooms.set(true);

    this.homestayService.getRoomsByHomestayId(this.homestayId).subscribe({
      next: res => {
        const rooms = res.data || [];

        const mappedRooms = rooms.map(room => this.mapRoomResponse(room));

        this.rooms.set(mappedRooms);
        this.isLoadingRooms.set(false);

        if (mappedRooms.length > 0) {
          const currentRoomId = this.selectedRoomId();

          const roomExists = currentRoomId
            ? mappedRooms.some(room => room.id === currentRoomId)
            : false;

          this.selectRoom(roomExists ? currentRoomId! : mappedRooms[0].id);
        }
      },
      error: err => {
        console.error('Load rooms failed:', err);

        this.rooms.set([]);
        this.selectedRoomId.set(null);
        this.isLoadingRooms.set(false);
      }
    });
  }

  private loadAmenities(): void {
    this.isLoadingAmenities.set(true);

    this.amenityService.getAllAmenities().subscribe({
      next: res => {
        const amenities = res.data || [];

        this.amenities.set(
          amenities.map(item => this.mapAmenityResponse(item))
        );

        this.isLoadingAmenities.set(false);
      },
      error: err => {
        console.error('Load amenities failed:', err);

        this.amenities.set([]);
        this.isLoadingAmenities.set(false);
      }
    });
  }

  private loadRoomHighlights(roomId: number): void {
    if (!this.homestayId) return;

    this.isLoadingHighlights.set(true);

    this.amenityService.getRoomAmenityHighlights(this.homestayId, roomId).subscribe({
      next: res => {
        const highlights = res.data || [];

        const selectedItems = highlights.map(item => ({
          amenityId: item.amenityId,
          displayValue: item.displayValue || null
        }));

        this.selectedByRoom.update(old => ({
          ...old,
          [roomId]: selectedItems
        }));

        this.isDirty.set(false);
        this.isLoadingHighlights.set(false);
      },
      error: err => {
        console.error('Load room amenity highlights failed:', err);

        this.selectedByRoom.update(old => ({
          ...old,
          [roomId]: []
        }));

        this.isDirty.set(false);
        this.isLoadingHighlights.set(false);
      }
    });
  }

  private mapRoomResponse(room: RoomDisplayResponse): RoomOption {
    return {
      id: room.id,
      name: room.name,
      type: room.type || this.buildRoomType(room),
      maxGuests: room.maxGuests || 2,
      imageUrl: this.getRoomCoverImage(room),
      area: room.area,
      bedCount: room.beds?.reduce((total, bed) => total + (bed.quantity || 0), 0) || undefined
    };
  }

  private buildRoomType(room: RoomDisplayResponse): string {
    const parts: string[] = [];

    if (room.area) {
      parts.push(`${room.area}`);
    }

    if (room.hasPrivateBathroom) {
      parts.push('Phòng tắm riêng');
    }

    if (room.isInstantBook) {
      parts.push('Đặt ngay');
    }

    return parts.length > 0 ? parts.join(' · ') : 'Phòng nghỉ';
  }

  private getRoomCoverImage(room: RoomDisplayResponse): string {
    const firstImage: any = room.images?.[0];

    if (!firstImage) {
      return 'assets/images/homestay-placeholder.jpg';
    }

    if (typeof firstImage === 'string') {
      return firstImage;
    }

    return (
      firstImage.imageUrl ||
      firstImage.url ||
      firstImage.cdnUrl ||
      'assets/images/homestay-placeholder.jpg'
    );
  }

  private mapAmenityResponse(item: AmenityResponse): RoomAmenityItem {
    return {
      id: item.id,
      name: item.name,
      iconName: item.iconName || 'widgets',
      groupName: item.groupName?.trim() || 'Room',
      placeholder: this.getPlaceholderByAmenity(item),
      popular: this.isPopularAmenity(item.id, item.name)
    };
  }

  private getPlaceholderByAmenity(item: AmenityResponse): string {
    const name = item.name.toLowerCase();

    if (name.includes('wifi')) return 'VD: 150 Mbps';
    if (name.includes('view') || name.includes('biển')) return 'VD: Hướng biển';
    if (name.includes('giường')) return 'VD: King Size';
    if (name.includes('tắm')) return 'VD: Riêng trong phòng';
    if (name.includes('điều hòa')) return 'VD: 2 chiều';
    if (name.includes('tv')) return 'VD: Smart TV 55 inch';

    return 'VD: Có sẵn';
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
      'view',
      'biển',
      'núi',
      'giường',
      'phòng tắm',
      'bồn tắm',
      'điều hòa',
      'tv',
      'ban công',
      'minibar'
    ].some(keyword => normalizedName.includes(keyword));
  }

  selectRoom(roomId: number): void {
    this.selectedRoomId.set(roomId);
    this.searchText.set('');
    this.activeGroup.set('POPULAR');

    this.loadRoomHighlights(roomId);
  }

  setActiveGroup(groupKey: string): void {
    this.activeGroup.set(groupKey);
  }

  isSelected(amenityId: number): boolean {
    return this.currentSelectedIds().has(amenityId);
  }

  toggleAmenity(amenity: RoomAmenityItem): void {
    if (!this.selectedRoomId()) {
      alert('Vui lòng chọn phòng trước.');
      return;
    }

    const current = [...this.currentSelected()];
    const index = current.findIndex(item => item.amenityId === amenity.id);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push({
        amenityId: amenity.id,
        displayValue: ''
      });
    }

    this.updateSelectedForCurrentRoom(current);
  }

  updateDisplayValue(amenityId: number, value: string): void {
    const current = this.currentSelected().map(item => {
      if (item.amenityId !== amenityId) return item;

      return {
        ...item,
        displayValue: value
      };
    });

    this.updateSelectedForCurrentRoom(current);
  }

  quickFill(amenity: RoomAmenityItem): void {
    if (!this.selectedRoomId()) {
      alert('Vui lòng chọn phòng trước.');
      return;
    }

    const current = [...this.currentSelected()];
    const index = current.findIndex(item => item.amenityId === amenity.id);
    const defaultValue = amenity.placeholder?.replace('VD: ', '') || amenity.name;

    if (index >= 0) {
      current[index] = {
        ...current[index],
        displayValue: defaultValue
      };
    } else {
      current.push({
        amenityId: amenity.id,
        displayValue: defaultValue
      });
    }

    this.updateSelectedForCurrentRoom(current);
  }

  getDisplayValue(amenityId: number): string {
    return this.currentSelected()
      .find(item => item.amenityId === amenityId)
      ?.displayValue || '';
  }

  removeSelectedAmenity(amenityId: number): void {
    const current = this.currentSelected()
      .filter(item => item.amenityId !== amenityId);

    this.updateSelectedForCurrentRoom(current);
  }

  clearCurrentRoom(): void {
    if (!this.selectedRoomId()) return;

    const ok = confirm('Bạn có chắc muốn xoá toàn bộ tiện nghi nổi bật của phòng này không?');

    if (!ok) return;

    this.updateSelectedForCurrentRoom([]);
  }

  private updateSelectedForCurrentRoom(items: SelectedRoomAmenity[]): void {
    const roomId = this.selectedRoomId();

    if (!roomId) return;

    this.selectedByRoom.update(old => ({
      ...old,
      [roomId]: items
    }));

    this.isDirty.set(true);
  }

  saveChanges(): void {
    const roomId = this.selectedRoomId();

    if (!this.homestayId || !roomId) {
      alert('Không tìm thấy phòng.');
      return;
    }

    const highlights: RoomAmenityHighlightRequest[] = this.currentSelected().map(item => ({
      amenityId: item.amenityId,
      displayValue: item.displayValue?.trim() || null
    }));

    this.isSaving.set(true);

    this.amenityService.updateRoomAmenityHighlights(
      this.homestayId,
      roomId,
      highlights
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isDirty.set(false);
        alert('Đã lưu tiện nghi nổi bật của phòng.');
      },
      error: err => {
        console.error('Save room amenity highlights failed:', err);

        this.isSaving.set(false);
        alert('Lưu tiện nghi phòng thất bại.');
      }
    });
  }
}