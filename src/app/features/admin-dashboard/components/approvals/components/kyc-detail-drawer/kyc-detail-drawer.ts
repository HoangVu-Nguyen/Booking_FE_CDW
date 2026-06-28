import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kyc-detail-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kyc-detail-drawer.html',
  styleUrl: './kyc-detail-drawer.css'
})
export class KycDetailDrawer {

  @Input() open = false;

  @Input() host: any;

  @Output() close = new EventEmitter<void>();

  closeDrawer() {
    this.close.emit();
  }

}