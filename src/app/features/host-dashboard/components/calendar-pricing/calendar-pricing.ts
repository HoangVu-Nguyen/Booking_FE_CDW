import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../../../core/services/calendar/calendar.service';
import { ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';
import { 
  CalendarInventoryResponse, 
  CalendarRoomResponse, 
  HomestayCalendarResponse, 
  RoomCalendarStatus 
} from '../../../../core/models/response/calendar.response';
import { RoomActionDrawer } from '../room-action-drawer/room-action-drawer';

@Component({
  selector: 'app-calendar-pricing',
  standalone: true,
  imports: [CommonModule, RoomActionDrawer],
  templateUrl: './calendar-pricing.html'
})
export class CalendarPricing implements OnInit {

  dateHeaders: { date: Date; dateStr: string; isWeekend: boolean; isToday: boolean }[] = [];
  
  // Dữ liệu API
  homeCalendarDetail!: HomestayCalendarResponse; 
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
    private cdr: ChangeDetectorRef,
    private location: Location
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
        if (response.data) {
          this.homeCalendarDetail = response.data;
          console.log('Lấy dữ liệu calendar thành công:', this.homeCalendarDetail);
          this.rooms = this.homeCalendarDetail.rooms || [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading calendar:', err)
    });
  }

  // --- Logic Modal Drawer ---
  openEditDrawer(roomId: number, start: string, end: string) {
    this.drawerData = null; 
    this.activeRoomId = roomId;
    this.activeRange = { start, end };

    const currentRoom = this.rooms.find(r => r.id === roomId);
    const startCell = currentRoom?.inventory.find(inv => inv.date.toString().split('T')[0] === start);
    
    const defaultPrice = startCell?.priceOverride || currentRoom?.basePrice || 1200000;
    const defaultInventory = startCell?.availableQuantity !== undefined ? startCell.availableQuantity : 8;

    this.calendarService.getCalendarDetails(this.homestayId, roomId, start, end)
      .subscribe({
        next: (response) => {
          const data: CalendarInventoryResponse[] = response.data || [];
          
          if (data.length > 0) {
            const firstPrice = data[0].priceOverride;
            const isMixed = data.some(d => d.priceOverride !== firstPrice);

            this.drawerData = { 
              ...data[0], 
              priceOverride: isMixed ? null : (firstPrice !== null ? firstPrice : defaultPrice), 
              availableQuantity: data[0].availableQuantity !== null ? data[0].availableQuantity : defaultInventory,
              isMixed ,
              owner: this.homeCalendarDetail.owner
            };
          } else {
            this.drawerData = {
              roomId: roomId,
              priceOverride: defaultPrice,
              availableQuantity: defaultInventory,
              status: RoomCalendarStatus.AVAILABLE,
              isMixed: false
            };
          }

          this.showDrawer = true;
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Error loading details:', err)
      });
  }

  handleCalendarUpdate(payload: any) {
    // Truyền thêm this.homestayId để Service gửi URL chuẩn REST (như đã thống nhất)
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
  goBack() {
  this.location.back();
}
}