import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { CalendarService } from '../../../../core/services/calendar/calendar.service';
import {
  BedResponse,
  CalendarInventoryResponse,
  CalendarRoomResponse,
  HomestayCalendarResponse,
  RoomCalendarStatus
} from '../../../../core/models/response/calendar.response';

import { RoomActionDrawer } from '../room-action-drawer/room-action-drawer';
import { SharedImageLightbox } from '../../../../shared/components/shared-image-lightbox/shared-image-lightbox';
import { LightboxImage } from '../../../../core/models/image/image.model';

@Component({
  selector: 'app-calendar-pricing',
  standalone: true,
  imports: [CommonModule, RoomActionDrawer, SharedImageLightbox],
  templateUrl: './calendar-pricing.html'
})
export class CalendarPricing implements OnInit {
  @ViewChild('lightbox') lightbox!: SharedImageLightbox;

  dateHeaders: {
    date: Date;
    dateStr: string;
    isWeekend: boolean;
    isToday: boolean;
  }[] = [];

  homeCalendarDetail: HomestayCalendarResponse | null = null;
  rooms: CalendarRoomResponse[] = [];

  currentStartDate: Date = new Date();
  homestayId!: number;

  searchKeyword = '';

  showDrawer = false;
  activeRoomId!: number;
  activeRange = { start: '', end: '' };
  drawerData: any = null;

  isDragging = false;
  dragStartCell: { roomId: number; date: Date } | null = null;
  dragEndCell: { roomId: number; date: Date } | null = null;

  readonly Status = RoomCalendarStatus;

  constructor(
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.generateDateHeaders(this.currentStartDate, 14);

    this.route.params.subscribe(params => {
      this.homestayId = Number(params['homestayId']);
      this.loadCalendarData();
    });
  }

  get filteredRooms(): CalendarRoomResponse[] {
    const keyword = this.searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return this.rooms;
    }

    return this.rooms.filter(room =>
      room.name?.toLowerCase().includes(keyword) ||
      room.tag?.toLowerCase().includes(keyword)
    );
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchKeyword = input.value || '';
  }

  loadCalendarData(): void {
    if (!this.homestayId || this.dateHeaders.length === 0) {
      return;
    }

    const start = this.dateHeaders[0].dateStr;
    const end = this.dateHeaders[this.dateHeaders.length - 1].dateStr;

    this.calendarService.getCalendarData(this.homestayId, start, end).subscribe({
      next: response => {
        this.homeCalendarDetail = response.data ?? null;
        this.rooms = this.homeCalendarDetail?.rooms ?? [];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading calendar:', err);
        this.homeCalendarDetail = null;
        this.rooms = [];
        this.cdr.detectChanges();
      }
    });
  }

  openEditDrawer(roomId: number, start: string, end: string): void {
    this.drawerData = null;
    this.activeRoomId = roomId;
    this.activeRange = { start, end };

    const currentRoom = this.rooms.find(room => room.id === roomId);

    this.calendarService.getCalendarDetails(this.homestayId, roomId, start, end).subscribe({
      next: response => {
        console.log(response)
        const data: CalendarInventoryResponse[] = response.data ?? [];

        if (data.length > 0) {
          const firstDayData = data[0];

          this.drawerData = {
            roomName: currentRoom?.name ?? '',
            availableQuantity: firstDayData.availableQuantity ?? 0,
            status: firstDayData.status ?? RoomCalendarStatus.AVAILABLE,
            owner: this.homeCalendarDetail?.owner,

            ratePlans: (firstDayData.ratePlanPrices ?? []).map(ratePlan => ({
              id: ratePlan.ratePlanId,
              name: ratePlan.name,
              basePrice: Number(ratePlan.basePrice ?? ratePlan.price ?? 0),
              editPrice: Number(ratePlan.price ?? ratePlan.basePrice ?? 0),
              hasOverride: ratePlan.hasOverride ?? false
            }))
          };
        } else {
          this.drawerData = {
            roomName: currentRoom?.name ?? '',
            availableQuantity: currentRoom?.inventory?.[0]?.availableQuantity ?? 0,
            status: RoomCalendarStatus.AVAILABLE,
            owner: this.homeCalendarDetail?.owner,

            ratePlans: (currentRoom?.ratePlans ?? []).map(ratePlan => ({
              id: ratePlan.ratePlanId,
              name: ratePlan.name,
              basePrice: Number(ratePlan.basePrice ?? ratePlan.price ?? 0),
              editPrice: Number(ratePlan.price ?? ratePlan.basePrice ?? 0),
              hasOverride: ratePlan.hasOverride ?? false
            }))
          };
        }

        this.showDrawer = true;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading details:', err);
      }
    });
  }

  handleCalendarUpdate(payload: any): void {
    console.log(payload)
    this.calendarService.updateBatchCalendar(payload).subscribe({
      next: () => {
        this.closeDrawer();
        this.loadCalendarData();
      },
      error: err => {
        console.error('Update failed:', err);
      }
    });
  }

  closeDrawer(): void {
    this.showDrawer = false;
    this.drawerData = null;
  }

  onMouseDown(roomId: number, date: Date): void {
    this.isDragging = true;
    this.dragStartCell = { roomId, date };
    this.dragEndCell = { roomId, date };
  }

  onMouseEnter(roomId: number, date: Date): void {
    if (!this.isDragging) return;
    if (this.dragStartCell?.roomId !== roomId) return;

    this.dragEndCell = { roomId, date };
  }

  onMouseUp(): void {
    if (!this.isDragging) return;

    this.isDragging = false;

    if (!this.dragStartCell || !this.dragEndCell) {
      this.clearDragState();
      return;
    }

    const startTime = this.dragStartCell.date.getTime();
    const endTime = this.dragEndCell.date.getTime();

    const startDate = startTime <= endTime ? this.dragStartCell.date : this.dragEndCell.date;
    const endDate = startTime <= endTime ? this.dragEndCell.date : this.dragStartCell.date;

    this.openEditDrawer(
      this.dragStartCell.roomId,
      this.formatDateStr(startDate),
      this.formatDateStr(endDate)
    );

    this.clearDragState();
  }

  clearDragState(): void {
    this.dragStartCell = null;
    this.dragEndCell = null;
  }

  isInRange(roomId: number, date: Date): boolean {
    if (!this.dragStartCell || !this.dragEndCell) return false;
    if (roomId !== this.dragStartCell.roomId) return false;

    const time = date.getTime();
    const start = Math.min(this.dragStartCell.date.getTime(), this.dragEndCell.date.getTime());
    const end = Math.max(this.dragStartCell.date.getTime(), this.dragEndCell.date.getTime());

    return time >= start && time <= end;
  }

  generateDateHeaders(startDate: Date, numberOfDays: number): void {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    this.dateHeaders = Array.from({ length: numberOfDays }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        date,
        dateStr: this.formatDateStr(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: date.toDateString() === new Date().toDateString()
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
    return this.rooms
      .find(room => room.id === roomId)
      ?.inventory?.find(inventory => String(inventory.date).split('T')[0] === dateStr);
  }

  getDisplayMonthTitle(): string {
    const firstDate = this.dateHeaders[0]?.date;

    if (!firstDate) {
      return '';
    }

    return `Tháng ${firstDate.getMonth() + 1}, ${firstDate.getFullYear()}`;
  }

  goPreviousWeek(): void {
    const newStartDate = new Date(this.currentStartDate);
    newStartDate.setDate(newStartDate.getDate() - 7);

    this.currentStartDate = newStartDate;
    this.generateDateHeaders(this.currentStartDate, 14);
    this.loadCalendarData();
  }

  goNextWeek(): void {
    const newStartDate = new Date(this.currentStartDate);
    newStartDate.setDate(newStartDate.getDate() + 7);

    this.currentStartDate = newStartDate;
    this.generateDateHeaders(this.currentStartDate, 14);
    this.loadCalendarData();
  }

  goBack(): void {
    this.location.back();
  }

  getCoverImage(room: CalendarRoomResponse): string {
    if (!room.images?.length) {
      return 'assets/images/default-room-placeholder.jpg';
    }

    const cover = room.images.find(image => image.isCover);
    return cover?.url || room.images[0].url;
  }

  getTotalBeds(beds: BedResponse[] | null | undefined): number {
    if (!beds?.length) {
      return 0;
    }

    return beds.reduce((total, bed) => total + Number(bed.quantity || 0), 0);
  }

  getBedTooltip(beds: BedResponse[] | null | undefined): string {
    if (!beds?.length) {
      return 'Chưa cấu hình giường';
    }

    return beds.map(bed => `${bed.quantity} giường ${bed.type}`).join(', ');
  }

  openRoomGallery(room: CalendarRoomResponse): void {
    if (!room.images?.length) {
      return;
    }

    const lightboxData: LightboxImage[] = room.images.map(image => ({
      url: image.url,
      isCover: image.isCover,
      caption: `Ảnh phòng ${room.name}`
    }));

    this.lightbox?.open(lightboxData, 0);
  }

  getRoomPreviewPrice(room: CalendarRoomResponse): number | null {
    const firstCellWithPrice = room.inventory?.find(
      cell => cell.displayPrice !== null && cell.displayPrice !== undefined
    );

    if (firstCellWithPrice?.displayPrice !== null && firstCellWithPrice?.displayPrice !== undefined) {
      return Number(firstCellWithPrice.displayPrice);
    }

    const minRatePlanPrice = this.getMinRatePlanPrice(room);

    if (minRatePlanPrice !== null) {
      return minRatePlanPrice;
    }

    if (room.basePrice !== null && room.basePrice !== undefined) {
      return Number(room.basePrice);
    }

    return null;
  }

  getCellDisplayPrice(
    cell: CalendarInventoryResponse | undefined,
    room: CalendarRoomResponse
  ): number | null {
    if (cell?.displayPrice !== null && cell?.displayPrice !== undefined) {
      return Number(cell.displayPrice);
    }

    if (cell?.priceOverride !== null && cell?.priceOverride !== undefined) {
      return Number(cell.priceOverride);
    }

    const minRatePlanPrice = this.getMinRatePlanPrice(room);

    if (minRatePlanPrice !== null) {
      return minRatePlanPrice;
    }

    if (room.basePrice !== null && room.basePrice !== undefined) {
      return Number(room.basePrice);
    }

    return null;
  }

  getMinRatePlanPrice(room: CalendarRoomResponse): number | null {
    const prices = (room.ratePlans ?? [])
      .map(ratePlan => ratePlan.price ?? ratePlan.basePrice)
      .filter((price): price is number => price !== null && price !== undefined)
      .map(price => Number(price))
      .filter(price => !Number.isNaN(price));

    if (prices.length === 0) {
      return null;
    }

    return Math.min(...prices);
  }

  formatShortPrice(price: number | null | undefined): string {
    if (price === null || price === undefined || Number.isNaN(Number(price))) {
      return 'Chưa giá';
    }

    const numericPrice = Number(price);

    if (numericPrice >= 1_000_000) {
      const million = numericPrice / 1_000_000;
      return `${Number.isInteger(million) ? million : million.toFixed(1)}M`;
    }

    return `${Math.round(numericPrice / 1000)}K`;
  }

  getGuestAvatarUrl(guestName: string | null | undefined): string {
    const safeName = encodeURIComponent(guestName || 'Guest');
    return `https://ui-avatars.com/api/?name=${safeName}&background=random&color=fff`;
  }

  trackByRoomId(_: number, room: CalendarRoomResponse): number {
    return room.id;
  }

  trackByDateStr(_: number, header: { dateStr: string }): string {
    return header.dateStr;
  }
}