import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-action-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-action-drawer.html',
  styleUrl: './room-action-drawer.css',
})
export class RoomActionDrawer  implements OnChanges {
  @Input() selectedRoomId!: number;
  @Input() dateRange: { start: string, end: string } = { start: '12 Oct', end: '15 Oct' };

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  activeTab: 'price' | 'inventory' | 'status' = 'price';
@Input() initialData: any;
ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      const data = changes['initialData'].currentValue;
      this.newPrice = data.priceOverride;
      this.newInventory = data.availableQuantity;
      this.roomStatus = data.status;
      
      // LOG ĐỂ DEBUG: xem dữ liệu mới đã vào chưa
      console.log('Drawer nhận dữ liệu mới:', data);
    }
  }
  // --- DỮ LIỆU CƠ BẢN ---
  newPrice: number | null = 1200000;
  newInventory: number | null = 8;
  
  roomStatus: 'AVAILABLE' | 'BLOCKED' = 'AVAILABLE';

  // --- DỮ LIỆU NGHIỆP VỤ PMS CHUYÊN SÂU ---
  minNights: number = 1;
  weekendFee: number | null = null;
  syncOta: boolean = true;

  // Dành riêng cho Tab Trạng thái (Bàn giao ca)
  blockReason: string = 'MAINTENANCE';
  internalNote: string = ''; // Ghi chú lưu vết
  notifyTeam: boolean = false; // Báo cáo kỹ thuật

  // --- INSIGHTS ---
  totalCapacity: number = 8;
  marketPrice: number = 1350000;


  onClose() {
    this.close.emit();
  }

  applyChanges() {
    // Validate trước khi submit
    if (this.activeTab === 'status' && this.roomStatus === 'BLOCKED' && !this.internalNote.trim()) {
      alert('Vui lòng nhập chi tiết bàn giao ca để người sau có thể nắm bắt thông tin sự cố.');
      return; // Bắt buộc phải có note khi khóa phòng
    }

    const payload: any = {
      roomId: this.selectedRoomId,
      startDate: this.dateRange.start,
      endDate: this.dateRange.end,
      actionType: this.activeTab,
      operator: 'Nguyễn Bùi Hoàng Vũ', // Lưu vết người sửa
      updatedAt: new Date().toISOString()
    };

    if (this.activeTab === 'price') {
      payload.priceOverride = this.newPrice;
      payload.minNights = this.minNights;
      payload.internalNote = this.internalNote;
    }
    else if (this.activeTab === 'inventory') {
      payload.availableQuantity = this.newInventory;
      payload.syncOta = this.syncOta;
    }
    else if (this.activeTab === 'status') {
      payload.status = this.roomStatus;
      if (this.roomStatus === 'BLOCKED') {
        payload.availableQuantity = 0;
        payload.blockReason = this.blockReason;
        payload.internalNote = this.internalNote;
        payload.createTaskForTeam = this.notifyTeam;
      }
    }

    console.log('PMS Audit Trail Saved:', payload);
    this.save.emit(payload);
    this.onClose();
  }
}