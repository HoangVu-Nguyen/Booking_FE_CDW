
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface RoomOption {
  id: number;
  name: string;
  type: string;
  maxGuests: number;
  imageUrl: string;
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
  displayValue: string;
}

@Component({
  selector: 'app-room-amenity-highlights',
  imports: [CommonModule,FormsModule],
  templateUrl: './room-amenity-highlights.html',
  styleUrl: './room-amenity-highlights.css',
})
export class RoomAmenityHighlights {
  isSaving = signal(false);
  isDirty = signal(false);

  searchText = signal('');
  activeGroup = signal('POPULAR');
  selectedRoomId = signal<number>(1);

  rooms: RoomOption[] = [
    {
      id: 1,
      name: 'Deluxe Ocean Room',
      type: 'Phòng đôi',
      maxGuests: 2,
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Family Garden Suite',
      type: 'Phòng gia đình',
      maxGuests: 4,
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Private Villa Room',
      type: 'Villa riêng',
      maxGuests: 6,
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format&fit=crop'
    }
  ];

  groups = [
    {
      key: 'POPULAR',
      title: 'Nổi bật',
      icon: 'star',
      description: 'Những tiện nghi nên hiển thị lớn ở card phòng.'
    },
    {
      key: 'SLEEPING',
      title: 'Giường ngủ',
      icon: 'bed',
      description: 'Loại giường, số giường và chất lượng nghỉ ngơi.'
    },
    {
      key: 'BATHROOM',
      title: 'Phòng tắm',
      icon: 'shower',
      description: 'Phòng tắm riêng, bồn tắm, nước nóng, máy sấy.'
    },
    {
      key: 'VIEW',
      title: 'Tầm nhìn',
      icon: 'landscape',
      description: 'View biển, view núi, view sân vườn hoặc thành phố.'
    },
    {
      key: 'WORK',
      title: 'Làm việc',
      icon: 'desk',
      description: 'Wifi, bàn làm việc, ổ cắm, đèn làm việc.'
    },
    {
      key: 'COMFORT',
      title: 'Tiện nghi phòng',
      icon: 'chair',
      description: 'Điều hòa, TV, minibar, tủ quần áo.'
    }
  ];

  amenities: RoomAmenityItem[] = [
    {
      id: 1,
      name: 'Wifi tốc độ cao',
      iconName: 'wifi',
      groupName: 'WORK',
      placeholder: 'VD: 150 Mbps',
      popular: true
    },
    {
      id: 2,
      name: 'Giường King',
      iconName: 'bed',
      groupName: 'SLEEPING',
      placeholder: 'VD: King Size',
      popular: true
    },
    {
      id: 3,
      name: 'Giường Queen',
      iconName: 'bed',
      groupName: 'SLEEPING',
      placeholder: 'VD: Queen Size'
    },
    {
      id: 4,
      name: '2 giường đơn',
      iconName: 'single_bed',
      groupName: 'SLEEPING',
      placeholder: 'VD: 2 giường đơn'
    },
    {
      id: 5,
      name: 'Phòng tắm riêng',
      iconName: 'bathroom',
      groupName: 'BATHROOM',
      placeholder: 'VD: Riêng trong phòng',
      popular: true
    },
    {
      id: 6,
      name: 'Bồn tắm',
      iconName: 'bathtub',
      groupName: 'BATHROOM',
      placeholder: 'VD: Bồn tắm nằm'
    },
    {
      id: 7,
      name: 'Nước nóng',
      iconName: 'water_heater',
      groupName: 'BATHROOM',
      placeholder: 'VD: 24/7',
      popular: true
    },
    {
      id: 8,
      name: 'Máy sấy tóc',
      iconName: 'air',
      groupName: 'BATHROOM',
      placeholder: 'VD: Có sẵn'
    },
    {
      id: 9,
      name: 'View biển',
      iconName: 'beach_access',
      groupName: 'VIEW',
      placeholder: 'VD: Hướng biển',
      popular: true
    },
    {
      id: 10,
      name: 'View núi',
      iconName: 'landscape',
      groupName: 'VIEW',
      placeholder: 'VD: View núi Sa Pa'
    },
    {
      id: 11,
      name: 'View sân vườn',
      iconName: 'yard',
      groupName: 'VIEW',
      placeholder: 'VD: Nhìn ra vườn'
    },
    {
      id: 12,
      name: 'Ban công riêng',
      iconName: 'balcony',
      groupName: 'VIEW',
      placeholder: 'VD: Ban công riêng',
      popular: true
    },
    {
      id: 13,
      name: 'Bàn làm việc',
      iconName: 'desk',
      groupName: 'WORK',
      placeholder: 'VD: Bàn rộng 1m2'
    },
    {
      id: 14,
      name: 'Ổ cắm gần giường',
      iconName: 'power',
      groupName: 'WORK',
      placeholder: 'VD: 2 ổ cắm'
    },
    {
      id: 15,
      name: 'Điều hòa',
      iconName: 'ac_unit',
      groupName: 'COMFORT',
      placeholder: 'VD: 2 chiều',
      popular: true
    },
    {
      id: 16,
      name: 'Smart TV',
      iconName: 'tv',
      groupName: 'COMFORT',
      placeholder: 'VD: 55 inch Netflix'
    },
    {
      id: 17,
      name: 'Minibar',
      iconName: 'local_bar',
      groupName: 'COMFORT',
      placeholder: 'VD: Có minibar'
    },
    {
      id: 18,
      name: 'Tủ quần áo',
      iconName: 'checkroom',
      groupName: 'COMFORT',
      placeholder: 'VD: Tủ lớn'
    }
  ];

  /**
   * Hardcode selected theo từng room.
   * Sau này API sẽ trả về theo roomId.
   */
  selectedByRoom = signal<Record<number, SelectedRoomAmenity[]>>({
    1: [
      { amenityId: 1, displayValue: '150 Mbps' },
      { amenityId: 2, displayValue: 'King Size' },
      { amenityId: 5, displayValue: 'Phòng tắm riêng' },
      { amenityId: 9, displayValue: 'View biển' },
      { amenityId: 15, displayValue: 'Điều hòa 2 chiều' }
    ],
    2: [
      { amenityId: 1, displayValue: '100 Mbps' },
      { amenityId: 4, displayValue: '2 giường đơn' },
      { amenityId: 11, displayValue: 'View sân vườn' },
      { amenityId: 12, displayValue: 'Ban công riêng' }
    ],
    3: [
      { amenityId: 1, displayValue: '200 Mbps' },
      { amenityId: 2, displayValue: 'King Size' },
      { amenityId: 6, displayValue: 'Bồn tắm nằm' },
      { amenityId: 12, displayValue: 'Ban công riêng' },
      { amenityId: 16, displayValue: 'Smart TV 55 inch' }
    ]
  });

  selectedRoom = computed(() => {
    return this.rooms.find(room => room.id === this.selectedRoomId()) || this.rooms[0];
  });

  currentSelected = computed(() => {
    return this.selectedByRoom()[this.selectedRoomId()] || [];
  });

  currentSelectedIds = computed(() => {
    return new Set(this.currentSelected().map(item => item.amenityId));
  });

  selectedAmenityViews = computed(() => {
    return this.currentSelected()
      .map(selected => {
        const amenity = this.amenities.find(item => item.id === selected.amenityId);

        if (!amenity) return null;

        return {
          ...amenity,
          displayValue: selected.displayValue
        };
      })
      .filter(Boolean) as Array<RoomAmenityItem & { displayValue: string }>;
  });

  filteredAmenities = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const activeGroup = this.activeGroup();

    return this.amenities.filter(item => {
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

  selectRoom(roomId: number): void {
    this.selectedRoomId.set(roomId);
    this.searchText.set('');
    this.activeGroup.set('POPULAR');
  }

  setActiveGroup(groupKey: string): void {
    this.activeGroup.set(groupKey);
  }

  isSelected(amenityId: number): boolean {
    return this.currentSelectedIds().has(amenityId);
  }

  toggleAmenity(amenity: RoomAmenityItem): void {
    const roomId = this.selectedRoomId();
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
    return this.currentSelected().find(item => item.amenityId === amenityId)?.displayValue || '';
  }

  removeSelectedAmenity(amenityId: number): void {
    const current = this.currentSelected().filter(item => item.amenityId !== amenityId);

    this.updateSelectedForCurrentRoom(current);
  }

  clearCurrentRoom(): void {
    const ok = confirm('Bạn có chắc muốn xoá toàn bộ tiện nghi nổi bật của phòng này không?');

    if (!ok) return;

    this.updateSelectedForCurrentRoom([]);
  }

  private updateSelectedForCurrentRoom(items: SelectedRoomAmenity[]): void {
    const roomId = this.selectedRoomId();

    this.selectedByRoom.update(old => ({
      ...old,
      [roomId]: items
    }));

    this.isDirty.set(true);
  }

  saveChanges(): void {
    this.isSaving.set(true);

    console.log('Payload update room amenity highlights:', this.payloadPreview());

    setTimeout(() => {
      this.isSaving.set(false);
      this.isDirty.set(false);
      alert('Đã lưu tiện nghi nổi bật của phòng.');
    }, 700);
  }
}