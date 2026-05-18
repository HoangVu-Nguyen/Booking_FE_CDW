import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripDetailResponse } from '../../../../../../core/models/response/trip-detail.response';

@Component({
  selector: 'app-booking-main-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-main-info.html',
  styleUrl: './booking-main-info.css',
})
export class BookingMainInfo {
  @Input({ required: true }) data!: TripDetailResponse;

  // Output Signal to emit event to parent component
  public openRules = output(); 

  /**
   * Triggers when user clicks on the Handbook/Rules card
   */
  public handleHandbookClick(): void {
    this.openRules.emit(); 
  }

  /**
   * Getter to aggregate booked space names
   * Format: "Master Suite Villa (x1), Deluxe Room (x2)"
   */
  get roomNamesDisplay(): string {
    if (!this.data?.rooms || this.data.rooms.length === 0) {
      return 'Updating spaces...';
    }
    return this.data.rooms
      .map(room => `${room.roomName} (x${room.quantity})`)
      .join(', ');
  }

  /**
   * Getter to parse payment method to standard badges
   */
  get paymentMethodBadge(): string {
    if (!this.data?.paymentMethod) return 'TRANSFER';
    const method = this.data.paymentMethod.toUpperCase();
    if (method.includes('VISA')) return 'VISA';
    if (method.includes('MASTER')) return 'MASTER';
    return 'CARD/WALLET';
  }
}