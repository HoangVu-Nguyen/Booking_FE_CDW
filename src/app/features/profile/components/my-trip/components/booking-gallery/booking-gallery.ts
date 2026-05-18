import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-booking-gallery',
  imports: [],
  templateUrl: './booking-gallery.html',
  styleUrl: './booking-gallery.css',
})
export class BookingGallery {
  @Input({ required: true }) images!: string[];
}
