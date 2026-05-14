import { Component, inject } from '@angular/core';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-checkout-summary',
  imports: [DecimalPipe,DatePipe],
  templateUrl: './checkout-summary.html',
  styleUrl: './checkout-summary.css',
})
export class CheckoutSummary {
  private bookingService = inject(BookingService);

  // Lấy thẳng data từ signal tổng của thằng Cha
  public data = this.bookingService.checkoutData;
}
