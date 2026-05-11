import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
@Component({
  selector: 'app-tour-booking-card',
  imports: [CurrencyPipe],
  templateUrl: './tour-booking-card.html',
  styleUrl: './tour-booking-card.css',
})
export class TourBookingCard {}
