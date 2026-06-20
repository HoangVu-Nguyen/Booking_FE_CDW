import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { HomestayService } from '../../../../../../../../core/services/homestay/homestay.service';
import { AmenityService } from '../../../../../../../../core/services/amenity/amenities.service';


import {
  RoomDisplayResponse,
  RatePlanResponse
} from '../../../../../../../../core/models/response/room.response';
import { RatePlanBenefitRequest } from '../../../../../../../../core/models/request/amenity.request';
import { AmenityResponse } from '../../../../../../../../core/models/response/homestay.response';
import { RoomService } from '../../../../../../../../core/services/room.service';

interface RoomOption {
  id: number;
  name: string;
  type: string;
  maxGuests: number;
  imageUrl: string;
  ratePlans: RatePlanOption[];
}

interface RatePlanOption {
  id: number;
  name: string;
  price: number;
  isNonRefundable: boolean;
}

interface BenefitItem {
  id: number;
  name: string;
  iconName: string;
  groupName: string;
  description: string;
  placeholder: string;
  popular?: boolean;
}

interface SelectedRatePlanBenefit {
  amenityId: number;
  displayValue: string | null;
}

@Component({
  selector: 'app-rate-plan-benefits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rate-plan-benefits.html',
  styleUrl: './rate-plan-benefits.css',
})
export class RatePlanBenefits implements OnInit {
  private route = inject(ActivatedRoute);
  private homestayService = inject(HomestayService);
  private amenityService = inject(AmenityService);
  private roomService = inject(RoomService);

  homestayId: string | null = null;

  isLoadingRooms = signal(false);
  isLoadingBenefits = signal(false);
  isLoadingSelectedBenefits = signal(false);

  isSaving = signal(false);
  isDirty = signal(false);

  searchText = signal('');
  activeGroup = signal('POPULAR');

  selectedRoomId = signal<number | null>(null);
  selectedRatePlanId = signal<number | null>(null);

  rooms = signal<RoomOption[]>([]);
  benefits = signal<BenefitItem[]>([]);

  selectedBenefitsByRatePlan = signal<Record<number, SelectedRatePlanBenefit[]>>({});

  groups = [
    {
      key: 'POPULAR',
      title: 'Phổ biến',
      icon: 'star'
    },
    {
      key: 'Connectivity',
      title: 'Kết nối',
      icon: 'wifi'
    },
    {
      key: 'Dining',
      title: 'Ăn uống',
      icon: 'restaurant'
    },
    {
      key: 'Policies',
      title: 'Hoàn huỷ',
      icon: 'event_busy'
    },
    {
      key: 'Service',
      title: 'Dịch vụ',
      icon: 'room_service'
    },
    {
      key: 'Facilities',
      title: 'Tiện nghi',
      icon: 'redeem'
    }
  ];

  private emptyRoom: RoomOption = {
    id: 0,
    name: 'Chưa có phòng',
    type: 'Chưa có dữ liệu',
    maxGuests: 0,
    imageUrl: 'assets/images/homestay-placeholder.jpg',
    ratePlans: []
  };

  selectedRoom = computed(() => {
    const rooms = this.rooms();
    const selectedId = this.selectedRoomId();

    return rooms.find(room => room.id === selectedId) || rooms[0] || this.emptyRoom;
  });

  ratePlans = computed(() => {
    return this.selectedRoom().ratePlans || [];
  });

  selectedRatePlan = computed(() => {
    const plans = this.ratePlans();
    const selectedId = this.selectedRatePlanId();

    return plans.find(plan => plan.id === selectedId) || plans[0] || null;
  });

  currentSelectedBenefits = computed(() => {
    const ratePlanId = this.selectedRatePlan()?.id;

    if (!ratePlanId) return [];

    return this.selectedBenefitsByRatePlan()[ratePlanId] || [];
  });

  currentSelectedBenefitIds = computed(() => {
    return new Set(this.currentSelectedBenefits().map(item => item.amenityId));
  });

  selectedBenefits = computed(() => {
    const selected = this.currentSelectedBenefits();
    const benefitList = this.benefits();

    return selected
      .map(item => {
        const benefit = benefitList.find(b => b.id === item.amenityId);

        if (!benefit) return null;

        return {
          ...benefit,
          displayValue: item.displayValue
        };
      })
      .filter(Boolean) as Array<BenefitItem & { displayValue: string | null }>;
  });

  filteredBenefits = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const activeGroup = this.activeGroup();
    const benefits = this.benefits();

    return benefits.filter(item => {
      const matchGroup =
        activeGroup === 'POPULAR'
          ? item.popular
          : item.groupName === activeGroup;

      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.groupName.toLowerCase().includes(query);

      return matchGroup && matchSearch;
    });
  });

  payloadPreview = computed(() => {
    return {
      roomId: this.selectedRoomId(),
      ratePlanId: this.selectedRatePlan()?.id,
      benefits: this.currentSelectedBenefits().map(item => ({
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

      this.loadRooms();
      this.loadBenefits();
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

        if (mappedRooms.length === 0) {
          this.selectedRoomId.set(null);
          this.selectedRatePlanId.set(null);
          return;
        }

        const firstRoom = mappedRooms[0];
        this.selectRoom(firstRoom.id);
      },
      error: err => {
        console.error('Load rooms failed:', err);

        this.rooms.set([]);
        this.selectedRoomId.set(null);
        this.selectedRatePlanId.set(null);
        this.isLoadingRooms.set(false);
      }
    });
  }

  private loadBenefits(): void {
    this.isLoadingBenefits.set(true);

    this.amenityService.getAllAmenities().subscribe({
      next: res => {
        const amenities = res.data || [];

        this.benefits.set(
          amenities.map(item => this.mapAmenityToBenefit(item))
        );

        this.isLoadingBenefits.set(false);
      },
      error: err => {
        console.error('Load benefits failed:', err);

        this.benefits.set([]);
        this.isLoadingBenefits.set(false);
      }
    });
  }

  private loadRatePlanBenefits(ratePlanId: number): void {
  const roomId = this.selectedRoomId();

  if (!this.homestayId || !roomId) return;

  this.isLoadingSelectedBenefits.set(true);

  this.roomService.getRatePlanBenefits(
    this.homestayId,
    roomId,
    ratePlanId
  ).subscribe({
    next: res => {
      const items = res.data || [];

      const nextBenefits: SelectedRatePlanBenefit[] = items
        .map((item: any): SelectedRatePlanBenefit | null => {
          const amenityId = Number(item.amenityId);

          if (!amenityId || Number.isNaN(amenityId)) {
            return null;
          }

          return {
            amenityId,
            displayValue: item.displayValue?.trim() || null
          };
        })
        .filter((item): item is SelectedRatePlanBenefit => item !== null);

      this.selectedBenefitsByRatePlan.update(old => ({
        ...old,
        [ratePlanId]: nextBenefits
      }));

      this.isDirty.set(false);
      this.isLoadingSelectedBenefits.set(false);
    },
    error: err => {
      console.error('Load rate plan benefits failed:', err);

      this.selectedBenefitsByRatePlan.update(old => ({
        ...old,
        [ratePlanId]: []
      }));

      this.isDirty.set(false);
      this.isLoadingSelectedBenefits.set(false);
    }
  });
}

  private mapRoomResponse(room: RoomDisplayResponse): RoomOption {
    return {
      id: room.id,
      name: room.name,
      type: this.buildRoomType(room),
      maxGuests: room.maxGuests || 2,
      imageUrl: this.getRoomCoverImage(room),
      ratePlans: (room.ratePlans || [])
        .filter(plan => !!plan.id)
        .map(plan => this.mapRatePlanResponse(plan))
    };
  }

  private mapRatePlanResponse(plan: RatePlanResponse): RatePlanOption {
    return {
      id: Number(plan.id),
      name: plan.name,
      price: Number(plan.price || 0),
      isNonRefundable: !!plan.isNonRefundable
    };
  }

  private buildRoomType(room: RoomDisplayResponse): string {
    const parts: string[] = [];

    if (room.type) {
      parts.push(room.type);
    }

    if (room.area) {
      parts.push(`${room.area}`);
    }

    if (room.hasPrivateBathroom) {
      parts.push('Phòng tắm riêng');
    }

    return parts.length ? parts.join(' · ') : 'Phòng nghỉ';
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

  private mapAmenityToBenefit(item: AmenityResponse): BenefitItem {
    return {
      id: item.id,
      name: item.name,
      iconName: item.iconName || 'widgets',
      groupName: item.groupName?.trim() || 'Facilities',
      description: this.getBenefitDescription(item),
      placeholder: this.getBenefitPlaceholder(item),
      popular: this.isPopularBenefit(item.id, item.name)
    };
  }

  private getBenefitDescription(item: AmenityResponse): string {
    const name = item.name.toLowerCase();

    if (name.includes('wifi')) {
      return 'Cấu hình tốc độ WiFi riêng cho từng gói, ví dụ 20 Mbps hoặc 50 Mbps.';
    }

    if (name.includes('sáng') || name.includes('breakfast')) {
      return 'Quyền lợi bữa sáng đi kèm trong gói giá.';
    }

    if (name.includes('huỷ') || name.includes('hủy')) {
      return 'Chính sách hoàn huỷ áp dụng riêng cho gói giá này.';
    }

    if (name.includes('không hoàn')) {
      return 'Gói giá ưu đãi hơn nhưng không áp dụng hoàn tiền.';
    }

    if (name.includes('thanh toán')) {
      return 'Phương thức thanh toán áp dụng cho gói giá này.';
    }

    return 'Quyền lợi hiển thị kèm theo gói giá khi khách chọn phòng.';
  }

  private getBenefitPlaceholder(item: AmenityResponse): string {
    const name = item.name.toLowerCase();

    if (name.includes('wifi')) return 'VD: 20 Mbps';
    if (name.includes('sáng') || name.includes('breakfast')) return 'VD: Buffet sáng';
    if (name.includes('huỷ') || name.includes('hủy')) return 'VD: Huỷ miễn phí trước 24h';
    if (name.includes('không hoàn')) return 'VD: Không hoàn tiền';
    if (name.includes('thanh toán')) return 'VD: Thanh toán tại chỗ';
    if (name.includes('thuế') || name.includes('phí')) return 'VD: Đã bao gồm thuế & phí';

    return 'VD: Có sẵn';
  }

  private getDefaultBenefitValue(benefit: BenefitItem): string | null {
    return benefit.placeholder.replace('VD: ', '') || null;
  }

  private isPopularBenefit(id: number, name: string): boolean {
    const popularIds = new Set([
      1, 2, 3,
      5, 6, 7, 8, 9,
      50, 51, 53, 55
    ]);

    if (popularIds.has(id)) return true;

    const normalizedName = name.toLowerCase();

    return [
      'wifi',
      'sáng',
      'breakfast',
      'huỷ',
      'hủy',
      'không hoàn',
      'thanh toán',
      'thuế',
      'phí',
      'lễ tân',
      'dọn phòng'
    ].some(keyword => normalizedName.includes(keyword));
  }

  selectRoom(roomId: number): void {
    this.selectedRoomId.set(roomId);

    const room = this.rooms().find(item => item.id === roomId);
    const firstPlan = room?.ratePlans?.[0];

    if (firstPlan) {
      this.selectRatePlan(firstPlan.id);
    } else {
      this.selectedRatePlanId.set(null);
    }

    this.searchText.set('');
    this.activeGroup.set('POPULAR');
  }

  selectRatePlan(ratePlanId: number): void {
    this.selectedRatePlanId.set(ratePlanId);
    this.searchText.set('');
    this.activeGroup.set('POPULAR');

    this.loadRatePlanBenefits(ratePlanId);
  }

  setActiveGroup(groupKey: string): void {
    this.activeGroup.set(groupKey);
  }

  isBenefitSelected(benefitId: number): boolean {
    return this.currentSelectedBenefitIds().has(benefitId);
  }

  toggleBenefit(benefitId: number): void {
    const ratePlanId = this.selectedRatePlan()?.id;

    if (!ratePlanId) {
      alert('Vui lòng chọn gói giá trước.');
      return;
    }

    const current = [...this.currentSelectedBenefits()];
    const index = current.findIndex(item => item.amenityId === benefitId);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      const benefit = this.benefits().find(item => item.id === benefitId);

      current.push({
        amenityId: benefitId,
        displayValue: benefit ? this.getDefaultBenefitValue(benefit) : null
      });
    }

    this.updateSelectedForCurrentRatePlan(current);
  }

  updateBenefitDisplayValue(benefitId: number, value: string): void {
    const current = this.currentSelectedBenefits().map(item => {
      if (item.amenityId !== benefitId) return item;

      return {
        ...item,
        displayValue: value
      };
    });

    this.updateSelectedForCurrentRatePlan(current);
  }

  getBenefitDisplayValue(benefitId: number): string {
    return this.currentSelectedBenefits()
      .find(item => item.amenityId === benefitId)
      ?.displayValue || '';
  }

  removeSelectedBenefit(benefitId: number): void {
    const current = this.currentSelectedBenefits()
      .filter(item => item.amenityId !== benefitId);

    this.updateSelectedForCurrentRatePlan(current);
  }

  applySuggestedByRatePlan(): void {
    const ratePlan = this.selectedRatePlan();

    if (!ratePlan) return;

    const candidates = this.benefits()
      .filter(item => item.popular)
      .filter(item => {
        const name = item.name.toLowerCase();

        if (ratePlan.isNonRefundable) {
          return !name.includes('huỷ miễn phí') && !name.includes('hủy miễn phí');
        }

        return !name.includes('không hoàn');
      })
      .slice(0, 7);

    const next = candidates.map(item => ({
      amenityId: item.id,
      displayValue: this.getDefaultBenefitValue(item)
    }));

    this.updateSelectedForCurrentRatePlan(next);
  }

  clearCurrentRatePlan(): void {
    const ratePlan = this.selectedRatePlan();

    if (!ratePlan) return;

    const ok = confirm(`Bạn có chắc muốn xoá toàn bộ quyền lợi của gói "${ratePlan.name}" không?`);

    if (!ok) return;

    this.updateSelectedForCurrentRatePlan([]);
  }

  private updateSelectedForCurrentRatePlan(items: SelectedRatePlanBenefit[]): void {
    const ratePlanId = this.selectedRatePlan()?.id;

    if (!ratePlanId) return;

    this.selectedBenefitsByRatePlan.update(old => ({
      ...old,
      [ratePlanId]: items
    }));

    this.isDirty.set(true);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }

  saveChanges(): void {
    const roomId = this.selectedRoomId();
    const ratePlanId = this.selectedRatePlan()?.id;

    if (!this.homestayId || !roomId || !ratePlanId) {
      alert('Không tìm thấy phòng hoặc gói giá.');
      return;
    }

    const benefits: RatePlanBenefitRequest[] = this.currentSelectedBenefits().map(item => ({
      amenityId: item.amenityId,
      displayValue: item.displayValue?.trim() || null
    }));

    this.isSaving.set(true);

    this.roomService.updateRatePlanBenefits(
      this.homestayId,
      roomId,
      ratePlanId,
      benefits
    ).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isDirty.set(false);
        alert('Đã lưu quyền lợi gói giá.');
      },
      error: err => {
        console.error('Save rate plan benefits failed:', err);

        this.isSaving.set(false);
        alert('Lưu quyền lợi gói giá thất bại.');
      }
    });
  }
}