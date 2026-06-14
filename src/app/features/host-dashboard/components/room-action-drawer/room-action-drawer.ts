import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OwnerResponse } from '../../../../core/models/response/homestay.response';

export interface DrawerRatePlanEdit {
  id: number;
  name: string;
  basePrice: number;
  editPrice: number | null;
  originalPrice: number | null;
  hasOverride: boolean;
  isNonRefundable: boolean;
}

@Component({
  selector: 'app-room-action-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-action-drawer.html',
  styleUrl: './room-action-drawer.css',
})
export class RoomActionDrawer implements OnChanges {
  @Input() selectedRoomId!: number;
  @Input() dateRange: { start: string; end: string } = {
    start: '',
    end: ''
  };
  @Input() initialData: any;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  activeTab: 'price' | 'inventory' | 'status' = 'price';

  drawerData: {
    roomName?: string;
    ratePlans: DrawerRatePlanEdit[];
  } = {
    roomName: '',
    ratePlans: []
  };

  newInventory: number | null = null;
  roomStatus: 'AVAILABLE' | 'BLOCKED' | 'MAINTENANCE' = 'AVAILABLE';

  minNights = 1;
  originalMinNights = 1;

  weekendFee: number | null = null;
  originalWeekendFee: number | null = null;

  syncOta = true;
  owner: OwnerResponse | null = null;

  blockReason: 'MAINTENANCE' | 'OWNER_BLOCK' | 'REPAIR' | 'OTHER' = 'MAINTENANCE';
  internalNote = '';
  notifyTeam = false;

  totalCapacity = 8;
  marketPrice = 1350000;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData']?.currentValue) {
      this.mapInitialData(changes['initialData'].currentValue);
    }
  }

  private mapInitialData(data: any): void {
    this.activeTab = 'price';

    this.internalNote = '';
    this.notifyTeam = false;
    this.blockReason = data.blockReason || 'MAINTENANCE';

    this.newInventory = this.toNullableNumber(data.availableQuantity);
    this.roomStatus = data.status || 'AVAILABLE';

    this.owner = data.owner ?? null;

    this.totalCapacity = Number(data.totalCapacity ?? data.maxQuantity ?? data.availableQuantity ?? 8);
    if (!this.totalCapacity || this.totalCapacity < 1) {
      this.totalCapacity = 8;
    }

    this.minNights = Number(data.minNights ?? 1);
    this.originalMinNights = this.minNights;

    this.weekendFee = this.toNullableNumber(data.weekendFee);
    this.originalWeekendFee = this.weekendFee;

    this.drawerData = {
      roomName: data.roomName ?? '',
      ratePlans: (data.ratePlans ?? []).map((ratePlan: any) => {
        const basePrice = this.toNumber(ratePlan.basePrice ?? ratePlan.price ?? ratePlan.editPrice);
        const currentPrice = this.toNullableNumber(
          ratePlan.editPrice ?? ratePlan.price ?? ratePlan.basePrice
        );

        return {
          id: Number(ratePlan.id ?? ratePlan.ratePlanId),
          name: ratePlan.name ?? 'Gói giá',
          basePrice,
          editPrice: currentPrice,
          originalPrice: currentPrice,
          hasOverride: Boolean(ratePlan.hasOverride),
          isNonRefundable: Boolean(ratePlan.isNonRefundable)
        };
      })
    };

    console.log('Drawer nhận dữ liệu mới:', data);
  }

  onClose(): void {
    this.close.emit();
  }

  applyChanges(): void {
    const payload: any = {
      roomId: this.selectedRoomId,
      startDate: this.dateRange.start,
      endDate: this.dateRange.end,
      actionType: this.activeTab,
      operatorId: (this.owner as any)?.id ?? null,
      updatedAt: new Date().toISOString()
    };

    if (this.activeTab === 'price') {
      const invalidPlan = this.drawerData.ratePlans.find(plan => {
        if (!this.hasRatePlanChanged(plan)) return false;
        return plan.editPrice === null || Number(plan.editPrice) <= 0;
      });

      if (invalidPlan) {
        alert(`Giá của gói "${invalidPlan.name}" không hợp lệ.`);
        return;
      }

      const ratePlanUpdates = this.drawerData.ratePlans
        .filter(plan => this.hasRatePlanChanged(plan))
        .map(plan => ({
          ratePlanId: plan.id,
          price: Number(plan.editPrice)
        }));

      if (
        ratePlanUpdates.length === 0 &&
        !this.hasPolicyChanged() &&
        !this.internalNote.trim()
      ) {
        alert('Chưa có thay đổi nào để lưu.');
        return;
      }

      payload.ratePlanUpdates = ratePlanUpdates;
      payload.minNights = Number(this.minNights || 1);
      payload.weekendFee = this.weekendFee;
      payload.internalNote = this.internalNote.trim();
    }

    if (this.activeTab === 'inventory') {
      if (this.newInventory === null || Number(this.newInventory) < 0) {
        alert('Số lượng phòng mở bán không hợp lệ.');
        return;
      }

      if (Number(this.newInventory) > this.totalCapacity) {
        alert(`Số lượng mở bán không được vượt quá ${this.totalCapacity} phòng.`);
        return;
      }

      payload.availableQuantity = Number(this.newInventory);
      payload.syncOta = this.syncOta;
      payload.internalNote = this.internalNote.trim();
    }

    if (this.activeTab === 'status') {
      if (this.roomStatus !== 'AVAILABLE' && !this.internalNote.trim()) {
        alert('Vui lòng nhập ghi chú nội bộ để lưu lý do đóng/khoá phòng.');
        return;
      }

      payload.status = this.roomStatus;
      payload.internalNote = this.internalNote.trim();

      if (this.roomStatus === 'AVAILABLE') {
        payload.availableQuantity = this.newInventory ?? this.totalCapacity;
      } else {
        payload.availableQuantity = 0;
        payload.blockReason = this.blockReason;
        payload.createTaskForTeam = this.notifyTeam;
      }
    }

    console.log('PMS Audit Trail Saved:', payload);

    // Không tự close ở đây. Để cha close sau khi API update thành công.
    this.save.emit(payload);
  }

  hasRatePlanChanged(plan: DrawerRatePlanEdit): boolean {
    const current = this.toNullableNumber(plan.editPrice);
    const original = this.toNullableNumber(plan.originalPrice);

    return current !== original;
  }

  hasPolicyChanged(): boolean {
    return (
      Number(this.minNights || 1) !== Number(this.originalMinNights || 1) ||
      this.toNullableNumber(this.weekendFee) !== this.toNullableNumber(this.originalWeekendFee)
    );
  }

  resetPlanToBasePrice(plan: DrawerRatePlanEdit): void {
    plan.editPrice = plan.basePrice;
  }

  getPlanDisplayPrice(plan: DrawerRatePlanEdit): number {
    return Number(plan.editPrice ?? plan.basePrice ?? 0);
  }

  getAllocatedRooms(): number {
    const inventory = Number(this.newInventory ?? 0);
    return Math.max(this.totalCapacity - inventory, 0);
  }

  getAllocatedPercent(): number {
    if (!this.totalCapacity) return 0;

    const percent = (this.getAllocatedRooms() / this.totalCapacity) * 100;
    return Math.min(Math.max(percent, 0), 100);
  }

  getOwnerName(): string {
    return (
      (this.owner as any)?.fullName ||
      (this.owner as any)?.name ||
      'Chủ nhà'
    );
  }

  getOwnerAvatar(): string {
    return (
      (this.owner as any)?.avatar ||
      (this.owner as any)?.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(this.getOwnerName())}&background=173124&color=fff`
    );
  }

  private toNumber(value: any): number {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? 0 : numberValue;
  }

  private toNullableNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }

  trackByPlanId(_: number, plan: DrawerRatePlanEdit): number {
    return plan.id;
  }
}