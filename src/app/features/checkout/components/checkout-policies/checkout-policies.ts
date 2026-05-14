import { Component, inject } from '@angular/core';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-checkout-policies',
  imports: [CommonModule],
  templateUrl: './checkout-policies.html',
  styleUrl: './checkout-policies.css',
})
export class CheckoutPolicies {
  private bookingService = inject(BookingService);
  public data = this.bookingService.checkoutData; 

}
