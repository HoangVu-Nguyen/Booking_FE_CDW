import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../../../core/services/calendar/calendar.service';
import { ActivatedRoute } from '@angular/router';
import { CalendarInventoryResponse, CalendarRoomResponse, RoomCalendarStatus } from '../../../../core/models/response/calendar.response';
import { RoomActionDrawer } from '../room-action-drawer/room-action-drawer';

@Component({
  selector: 'app-calendar-pricing',
  standalone: true,
  imports: [CommonModule, RoomActionDrawer],
  templateUrl: './calendar-pricing.html'
})
export class CalendarPricing implements OnInit {

  dateHeaders: { date: Date; dateStr: string; isWeekend: boolean; isToday: boolean }[] = [];
  rooms: CalendarRoomResponse[] = [];
  currentStartDate: Date = new Date();
  homestayId!: number;
  
  // Trạng thái Drawer
  showDrawer = false;
  activeRoomId!: number;
  activeRange = { start: '', end: '' };
  drawerData: any = null;

  // Trạng thái kéo thả
  isDragging = false;
  dragStartCell: { roomId: number, date: Date } | null = null;
  dragEndCell: { roomId: number, date: Date } | null = null;

  readonly Status = RoomCalendarStatus;

  constructor(
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.generateDateHeaders(new Date(), 14);
    this.route.params.subscribe(params => {
      this.homestayId = +params['homestayId'];
      this.loadCalendarData();
    });
  }

  loadCalendarData() {
    const start = this.formatDateStr(this.dateHeaders[0].date);
    const end = this.formatDateStr(this.dateHeaders[this.dateHeaders.length - 1].date);

    this.calendarService.getCalendarData(this.homestayId, start, end).subscribe({
      next: (response) => {
        this.rooms = response.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading calendar:', err)
    });
  }

  // --- Logic Modal Drawer ---
  openEditDrawer(roomId: number, start: string, end: string) {
    // 1. Reset trạng thái và dọn sạch dữ liệu cũ ngay lập tức
    this.drawerData = null; 
    this.activeRoomId = roomId;
    this.activeRange = { start, end };

    // 2. Tìm giá và số lượng thực tế đang hiển thị trên ô lịch làm phương án dự phòng (Fallback)
    const currentRoom = this.rooms.find(r => r.id === roomId);
    const startCell = currentRoom?.inventory.find(inv => inv.date.toString().split('T')[0] === start);
    
    // Ưu tiên lấy giá ô lịch đang hiện, nếu không có mới lấy basePrice, cuối cùng là giá sàn hệ thống
    const defaultPrice = startCell?.priceOverride || currentRoom?.basePrice || 1200000;
    const defaultInventory = startCell?.availableQuantity !== undefined ? startCell.availableQuantity : 8;

    // 3. Gọi API lấy dữ liệu chi tiết từ DB
    this.calendarService.getCalendarDetails(this.homestayId, roomId, start, end)
      .subscribe({
        next: (response) => {
          const data = response.data || [];
          
          if (data.length > 0) {
            const firstPrice = data[0].priceOverride;
            const isMixed = data.some((d: any) => d.priceOverride !== firstPrice);

            // Đóng gói dữ liệu gửi xuống component con
            this.drawerData = { 
              ...data[0], 
              // Nếu các ngày bị lệch giá (Mixed) thì để null, nếu giống nhau thì lấy giá override từ DB. 
              // Nếu giá override từ DB là null (chưa từng sửa), dùng ngay giá dự phòng đang hiện ở ô lịch.
              priceOverride: isMixed ? null : (firstPrice !== null ? firstPrice : defaultPrice), 
              availableQuantity: data[0].availableQuantity !== null ? data[0].availableQuantity : defaultInventory,
              isMixed 
            };
          } else {
            // Trường hợp dải ngày này hoàn toàn trống (chưa từng có bản ghi trong bảng room_calendar)
            this.drawerData = {
              roomId: roomId,
              priceOverride: defaultPrice,
              availableQuantity: defaultInventory,
              status: 'AVAILABLE',
              isMixed: false
            };
          }

          // 4. Bật Drawer và ÉP Angular đồng bộ dữ liệu xuống Component con ngay tức thì
          this.showDrawer = true;
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Error loading details:', err)
      });
  }

  handleCalendarUpdate(payload: any) {
    this.calendarService.updateBatchCalendar( payload).subscribe({
      next: () => {
        this.loadCalendarData();
        this.closeDrawer();
      },
      error: (err) => console.error('Update failed:', err)
    });
  }

  closeDrawer() {
    this.showDrawer = false;
  }

  // --- Logic Kéo thả ---
  onMouseDown(roomId: number, date: Date) {
    this.isDragging = true;
    this.dragStartCell = { roomId, date };
    this.dragEndCell = { roomId, date };
  }

  onMouseEnter(roomId: number, date: Date) {
    if (this.isDragging && this.dragStartCell?.roomId === roomId) {
      this.dragEndCell = { roomId, date };
    }
  }

  onMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (this.dragStartCell && this.dragEndCell) {
      const d1 = this.dragStartCell.date.getTime();
      const d2 = this.dragEndCell.date.getTime();

      const start = d1 < d2 ? this.dragStartCell.date : this.dragEndCell.date;
      const end = d1 > d2 ? this.dragStartCell.date : this.dragEndCell.date;

      this.openEditDrawer(
        this.dragStartCell.roomId, 
        this.formatDateStr(start), 
        this.formatDateStr(end)
      );
    }
  }

  isInRange(roomId: number, date: Date): boolean {
    if (!this.dragStartCell || !this.dragEndCell) return false;
    const time = date.getTime();
    const start = Math.min(this.dragStartCell.date.getTime(), this.dragEndCell.date.getTime());
    const end = Math.max(this.dragStartCell.date.getTime(), this.dragEndCell.date.getTime());
    return roomId === this.dragStartCell.roomId && time >= start && time <= end;
  }

  // --- Helper Methods ---
  generateDateHeaders(startDate: Date, numberOfDays: number) {
    this.dateHeaders = Array.from({ length: numberOfDays }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return {
        date: d,
        dateStr: this.formatDateStr(d),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        isToday: d.toDateString() === new Date().toDateString()
      };
    });
  }

  formatDateStr(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getCalendarCell(roomId: number, dateStr: string): CalendarInventoryResponse | undefined {
    return this.rooms.find(r => r.id === roomId)?.inventory
      .find(inv => inv.date.toString().split('T')[0] === dateStr);
  }

  goPreviousWeek() {
    this.currentStartDate.setDate(this.currentStartDate.getDate() - 7);
    this.generateDateHeaders(this.currentStartDate, 14);
    this.loadCalendarData();
  }

  goNextWeek() {
    this.currentStartDate.setDate(this.currentStartDate.getDate() + 7);
    this.generateDateHeaders(this.currentStartDate, 14);
    this.loadCalendarData();
  }
}