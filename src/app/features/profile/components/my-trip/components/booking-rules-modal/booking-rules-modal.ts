import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { TripDetailResponse } from '../../../../../../core/models/response/trip-detail.response'; // Update to your correct relative path

@Component({
  selector: 'app-booking-rules-modal',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './booking-rules-modal.html',
  styleUrl: './booking-rules-modal.css',
})
export class BookingRulesModal {
  // Map type structure strictly from backend response
  @Input() policyData?: TripDetailResponse; 
  @Input({ required: true }) isOpen: boolean = false;
  
  @Output() close = new EventEmitter<void>();

  public onCloseModal(): void {
    this.close.emit();
  }
}