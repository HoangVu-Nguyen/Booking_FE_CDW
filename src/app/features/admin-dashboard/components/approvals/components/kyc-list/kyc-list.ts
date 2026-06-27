import { Component, EventEmitter, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-kyc-list',
  imports: [DatePipe, CommonModule],
  templateUrl: './kyc-list.html',
  styleUrl: './kyc-list.css',
})
export class KycList {
  pendingHosts = [
    { id: 'HST-001', name: 'Nguyễn Bùi Hoàng Vũ', submittedAt: new Date(), aiConfidence: 98 },
    { id: 'HST-002', name: 'Trần Thị Thu Thảo', submittedAt: new Date(Date.now() - 3600000), aiConfidence: 85 },
    { id: 'HST-003', name: 'Lê Hải Nam', submittedAt: new Date(Date.now() - 7200000), aiConfidence: 92 }
  ];
  @Output()
  viewHost = new EventEmitter<any>();

  openKycModal(host: any) {

    this.viewHost.emit(host);

  }
}
