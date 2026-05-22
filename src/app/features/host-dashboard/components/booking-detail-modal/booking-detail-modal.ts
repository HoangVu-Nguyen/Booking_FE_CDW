import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HostBookingItemResponse } from '../../../../core/models/response/booking.response';
import {CurrencyPipe, DatePipe} from '@angular/common';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-booking-detail-modal',
  imports: [CurrencyPipe, DatePipe, CommonModule],
  templateUrl: './booking-detail-modal.html',
  styleUrl: './booking-detail-modal.css',
})
export class BookingDetailModal {
  @Input() booking: HostBookingItemResponse | null = null;
  @Input() isOpen: boolean = false;

  // Bắn sự kiện "Đóng" ngược lại cho Component Cha
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit(); // Bắn pháo sáng báo cho Cha biết là tui muốn đóng
  }
}
