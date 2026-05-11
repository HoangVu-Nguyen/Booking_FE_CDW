import { Component } from '@angular/core';
import { TourHero } from './components/tour-hero/tour-hero';
import { TourItinerary } from './components/tour-itinerary/tour-itinerary';
import { TourReviews } from './components/tour-reviews/tour-reviews';
import { TourBookingCard } from './components/tour-booking-card/tour-booking-card';
@Component({
  selector: 'app-tour-detail',
  imports: [TourHero,TourItinerary,TourReviews,TourBookingCard],
  templateUrl: './tour-detail.html',
  styleUrl: './tour-detail.css',
})
export class TourDetail {}
