import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  popular?: boolean;
}

@Component({
  selector: 'app-rate-plan-benefits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rate-plan-benefits.html',
  styleUrl: './rate-plan-benefits.css',
})
export class RatePlanBenefits {
  isSaving = signal(false);
  isDirty = signal(false);

  searchText = signal('');
  activeGroup = signal('POPULAR');

  selectedRoomId = signal<number>(1);
  selectedRatePlanId = signal<number>(101);

  rooms: RoomOption[] = [
    {
      id: 1,
      name: 'Family Suite',
      type: 'Phòng gia đình',
      maxGuests: 5,
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&auto=format&fit=crop',
      ratePlans: [
        {
          id: 101,
          name: 'Standard Rate',
          price: 1450000,
          isNonRefundable: false
        },
        {
          id: 102,
          name: 'Non-refundable Rate',
          price: 1300000,
          isNonRefundable: true
        }
      ]
    },
    {
      id: 2,
      name: 'Deluxe Ocean Room',
      type: 'Phòng đôi',
      maxGuests: 2,
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&auto=format&fit=crop',
      ratePlans: [
        {
          id: 201,
          name: 'Standard Rate',
          price: 980000,
          isNonRefundable: false
        },
        {
          id: 202,
          name: 'Early Bird',
          price: 880000,
          isNonRefundable: true
        }
      ]
    },
    {
      id: 3,
      name: 'Private Villa Room',
      type: 'Villa riêng',
      maxGuests: 6,
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format&fit=crop',
      ratePlans: [
        {
          id: 301,
          name: 'Villa Flexible',
          price: 2200000,
          isNonRefundable: false
        },
        {
          id: 302,
          name: 'Villa Saver',
          price: 1950000,
          isNonRefundable: true
        }
      ]
    }
  ];

  groups = [
    {
      key: 'POPULAR',
      title: 'Phổ biến',
      icon: 'star'
    },
    {
      key: 'PAYMENT',
      title: 'Thanh toán',
      icon: 'payments'
    },
    {
      key: 'CANCELLATION',
      title: 'Hoàn huỷ',
      icon: 'event_busy'
    },
    {
      key: 'MEAL',
      title: 'Ăn uống',
      icon: 'restaurant'
    },
    {
      key: 'SERVICE',
      title: 'Dịch vụ',
      icon: 'room_service'
    },
    {
      key: 'EXTRA',
      title: 'Quyền lợi thêm',
      icon: 'redeem'
    }
  ];

  benefits: BenefitItem[] = [
    {
      id: 1,
      name: 'WiFi miễn phí',
      iconName: 'wifi',
      groupName: 'POPULAR',
      description: 'Khách được sử dụng WiFi miễn phí trong suốt thời gian lưu trú.',
      popular: true
    },
    {
      id: 2,
      name: 'Điều hòa',
      iconName: 'ac_unit',
      groupName: 'POPULAR',
      description: 'Phòng có điều hòa, phù hợp nghỉ dưỡng cả ngày.',
      popular: true
    },
    {
      id: 3,
      name: 'Bữa sáng',
      iconName: 'free_breakfast',
      groupName: 'MEAL',
      description: 'Giá phòng đã bao gồm bữa sáng cho khách.',
      popular: true
    },
    {
      id: 4,
      name: 'Lễ tân 24h',
      iconName: 'support_agent',
      groupName: 'SERVICE',
      description: 'Có hỗ trợ lễ tân hoặc host trong suốt thời gian lưu trú.',
      popular: true
    },
    {
      id: 5,
      name: 'Huỷ miễn phí',
      iconName: 'event_available',
      groupName: 'CANCELLATION',
      description: 'Khách có thể huỷ miễn phí theo chính sách của chỗ nghỉ.',
      popular: true
    },
    {
      id: 6,
      name: 'Không hoàn tiền',
      iconName: 'lock',
      groupName: 'CANCELLATION',
      description: 'Gói giá ưu đãi hơn nhưng không áp dụng hoàn tiền.',
      popular: true
    },
    {
      id: 7,
      name: 'Thanh toán tại chỗ',
      iconName: 'payments',
      groupName: 'PAYMENT',
      description: 'Khách có thể thanh toán trực tiếp tại chỗ nghỉ.',
      popular: true
    },
    {
      id: 8,
      name: 'Thanh toán online',
      iconName: 'credit_card',
      groupName: 'PAYMENT',
      description: 'Khách thanh toán online trước khi nhận phòng.',
    },
    {
      id: 9,
      name: 'Đã bao gồm thuế & phí',
      iconName: 'receipt_long',
      groupName: 'PAYMENT',
      description: 'Giá hiển thị đã bao gồm thuế và phí dịch vụ.',
      popular: true
    },
    {
      id: 10,
      name: 'Dọn phòng hằng ngày',
      iconName: 'cleaning_services',
      groupName: 'SERVICE',
      description: 'Có dịch vụ dọn phòng trong thời gian lưu trú.',
    },
    {
      id: 11,
      name: 'Nhận phòng sớm',
      iconName: 'schedule',
      groupName: 'EXTRA',
      description: 'Hỗ trợ nhận phòng sớm nếu còn phòng trống.',
    },
    {
      id: 12,
      name: 'Trả phòng muộn',
      iconName: 'more_time',
      groupName: 'EXTRA',
      description: 'Hỗ trợ trả phòng muộn theo tình trạng phòng.',
    },
    {
      id: 13,
      name: 'Nước uống miễn phí',
      iconName: 'water_drop',
      groupName: 'EXTRA',
      description: 'Có nước uống miễn phí trong phòng.',
    },
    {
      id: 14,
      name: 'Ưu đãi dài ngày',
      iconName: 'sell',
      groupName: 'EXTRA',
      description: 'Có giá tốt hơn cho khách đặt nhiều đêm.',
    }
  ];

  /**
   * Hardcode benefits theo từng ratePlanId.
   * Sau này API sẽ trả về theo rate_plan_benefit_mapping.
   */
  selectedBenefitIdsByRatePlan = signal<Record<number, number[]>>({
    101: [1, 2, 3, 4, 5, 7, 9],
    102: [1, 2, 3, 4, 6, 7, 9],
    201: [1, 2, 5, 7, 9],
    202: [1, 2, 6, 8, 9],
    301: [1, 2, 3, 4, 5, 7, 9, 10, 11],
    302: [1, 2, 3, 4, 6, 8, 9]
  });

  selectedRoom = computed(() => {
    return this.rooms.find(room => room.id === this.selectedRoomId()) || this.rooms[0];
  });

  ratePlans = computed(() => {
    return this.selectedRoom()?.ratePlans || [];
  });

  selectedRatePlan = computed(() => {
    const plans = this.ratePlans();

    return plans.find(plan => plan.id === this.selectedRatePlanId()) || plans[0];
  });

  currentSelectedBenefitIds = computed(() => {
    const ratePlanId = this.selectedRatePlan()?.id;

    if (!ratePlanId) return new Set<number>();

    return new Set(this.selectedBenefitIdsByRatePlan()[ratePlanId] || []);
  });

  selectedBenefits = computed(() => {
    const selected = this.currentSelectedBenefitIds();

    return this.benefits.filter(item => selected.has(item.id));
  });

  filteredBenefits = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const activeGroup = this.activeGroup();

    return this.benefits.filter(item => {
      const matchGroup =
        activeGroup === 'POPULAR'
          ? item.popular
          : item.groupName === activeGroup;

      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchGroup && matchSearch;
    });
  });

  payloadPreview = computed(() => {
    return {
      roomId: this.selectedRoomId(),
      ratePlanId: this.selectedRatePlan()?.id,
      benefitAmenityIds: Array.from(this.currentSelectedBenefitIds())
    };
  });

  selectRoom(roomId: number): void {
    this.selectedRoomId.set(roomId);

    const room = this.rooms.find(item => item.id === roomId);

    if (room?.ratePlans?.length) {
      this.selectedRatePlanId.set(room.ratePlans[0].id);
    }

    this.searchText.set('');
    this.activeGroup.set('POPULAR');
  }

  selectRatePlan(ratePlanId: number): void {
    this.selectedRatePlanId.set(ratePlanId);
    this.searchText.set('');
    this.activeGroup.set('POPULAR');
  }

  setActiveGroup(groupKey: string): void {
    this.activeGroup.set(groupKey);
  }

  isBenefitSelected(benefitId: number): boolean {
    return this.currentSelectedBenefitIds().has(benefitId);
  }

  toggleBenefit(benefitId: number): void {
    const ratePlanId = this.selectedRatePlan()?.id;

    if (!ratePlanId) return;

    const current = new Set(this.selectedBenefitIdsByRatePlan()[ratePlanId] || []);

    if (current.has(benefitId)) {
      current.delete(benefitId);
    } else {
      current.add(benefitId);
    }

    this.selectedBenefitIdsByRatePlan.update(old => ({
      ...old,
      [ratePlanId]: Array.from(current)
    }));

    this.isDirty.set(true);
  }

  removeSelectedBenefit(benefitId: number): void {
    this.toggleBenefit(benefitId);
  }

  applySuggestedByRatePlan(): void {
    const ratePlan = this.selectedRatePlan();

    if (!ratePlan) return;

    const flexibleBenefitIds = [1, 2, 3, 4, 5, 7, 9];
    const nonRefundableBenefitIds = [1, 2, 3, 4, 6, 8, 9];

    const next = ratePlan.isNonRefundable
      ? nonRefundableBenefitIds
      : flexibleBenefitIds;

    this.selectedBenefitIdsByRatePlan.update(old => ({
      ...old,
      [ratePlan.id]: next
    }));

    this.isDirty.set(true);
  }

  clearCurrentRatePlan(): void {
    const ratePlan = this.selectedRatePlan();

    if (!ratePlan) return;

    const ok = confirm(`Bạn có chắc muốn xoá toàn bộ quyền lợi của gói "${ratePlan.name}" không?`);

    if (!ok) return;

    this.selectedBenefitIdsByRatePlan.update(old => ({
      ...old,
      [ratePlan.id]: []
    }));

    this.isDirty.set(true);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }

  saveChanges(): void {
    const payload = this.payloadPreview();

    if (!payload.ratePlanId) {
      alert('Không tìm thấy gói giá.');
      return;
    }

    this.isSaving.set(true);

    console.log('Payload update rate plan benefits:', payload);

    setTimeout(() => {
      this.isSaving.set(false);
      this.isDirty.set(false);
      alert('Đã lưu quyền lợi gói giá.');
    }, 700);
  }
}