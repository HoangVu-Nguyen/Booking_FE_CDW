import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourTimelineInfo } from '../../../../../../core/models/response/trip-detail.response';

@Component({
  selector: 'app-booking-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-timeline.html',
  styleUrl: './booking-timeline.css',
})
export class BookingTimeline {
  @Input({ required: true }) tours!: TourTimelineInfo[];
  @Input({ required: true }) checkIn!: string;
  @Input({ required: true }) checkOut!: string;
  @Input() propertyName: string = 'Khu nghỉ dưỡng';
}