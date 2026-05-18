import { Component, inject } from '@angular/core';
import { BookingTimeline } from './components/booking-timeline/booking-timeline';
import { BookingReviewBanner } from './components/booking-review-banner/booking-review-banner';
import { BookingMainInfo } from './components/booking-main-info/booking-main-info';
import { BookingGallery } from './components/booking-gallery/booking-gallery';
import { BookingConcierge } from './components/booking-concierge/booking-concierge';
import { BookingMap } from './components/booking-map/booking-map';
import { ActivatedRoute } from '@angular/router';
import { TripService } from '../../../../core/services/trip/trip.service';
@Component({
  selector: 'app-my-trip',
  imports: [BookingTimeline, BookingReviewBanner, BookingMainInfo, BookingGallery, BookingConcierge, BookingMap],
  templateUrl: './my-trip.html',
  styleUrl: './my-trip.css',
})
export class MyTrip {
  private route = inject(ActivatedRoute);
  public tripService = inject(TripService);

  ngOnInit(): void {
    const bookingCode = this.route.snapshot.paramMap.get('code');
    
    if (bookingCode) {
        // 2. Gọi API kéo data về
        this.tripService.fetchTripDetail(bookingCode);
        console.log(this.tripService.currentTripDetail())
    }
  }

  ngOnDestroy(): void {
    this.tripService.clearTripDetail();
  }
}
