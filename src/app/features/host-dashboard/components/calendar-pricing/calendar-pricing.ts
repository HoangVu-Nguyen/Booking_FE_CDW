import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../../../core/services/calendar/calendar.service';
import { ActivatedRoute } from '@angular/router';
import { CalendarInventoryResponse, CalendarRoomResponse, RoomCalendarStatus } from '../../../../core/models/response/calendar.response';


@Component({
  selector: 'app-calendar-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-pricing.html'
})
export class CalendarPricing implements OnInit {

  dateHeaders: { date: Date; dateStr: string; isWeekend: boolean; isToday: boolean }[] = [];
  rooms: CalendarRoomResponse[] = []; // Dùng Interface chuẩn
  homestayId!: number;
  isLoading = true;
  currentStartDate: Date = new Date(); // Ngày bắt đầu hiển thị
  // Expose Enum ra view để dùng trong *ngIf
  readonly Status = RoomCalendarStatus;

  constructor(
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const customStartDate = new Date(); // Lưu ý: Tháng trong JS tính từ 0 (8 = tháng 9)
    this.generateDateHeaders(customStartDate, 6);
    this.route.params.subscribe(params => {
      this.homestayId = +params['homestayId'];
      this.loadCalendarData();
    });
  }

  loadCalendarData() {
    this.isLoading = true;
    const start = this.formatDateStr(this.dateHeaders[0].date);
    const end = this.formatDateStr(this.dateHeaders[this.dateHeaders.length - 1].date);

    this.calendarService.getCalendarData(this.homestayId, start, end).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.rooms = response.data || [];
        this.isLoading = false;
        this.cdr.detectChanges(); // 3. Gọi hàm này sau khi cập nhật dữ liệu
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  refreshCalendar() {
    this.generateDateHeaders(this.currentStartDate, 14); // Load 14 ngày
    this.loadCalendarData();
  }

  goPreviousWeek() {
    this.currentStartDate.setDate(this.currentStartDate.getDate() - 7);
    this.refreshCalendar();
  }

  goNextWeek() {
    this.currentStartDate.setDate(this.currentStartDate.getDate() + 7);
    this.refreshCalendar();
  }

  generateDateHeaders(startDate: Date, numberOfDays: number) {
    this.dateHeaders = [];
    for (let i = 0; i < numberOfDays; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + i);
      this.dateHeaders.push({
        date: nextDate,
        dateStr: nextDate.toISOString().split('T')[0],
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
        isToday: nextDate.toDateString() === new Date().toDateString()
      });
    }
  }


  formatDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  getCalendarCell(roomId: number, dateStr: string): CalendarInventoryResponse | undefined {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return undefined;

    return room.inventory.find(inv => {
      // Chuẩn hóa chuỗi ngày từ API: lấy phần YYYY-MM-DD trước chữ 'T' (nếu có)
      const invDate = inv.date.toString().split('T')[0].trim();
      // So sánh trực tiếp với dateStr (vốn đã được format yyyy-MM-dd)
      return invDate === dateStr;
    });
  }
}