import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges, ViewChild } from '@angular/core';
import { HomestayResponse } from '../../../core/models/response/homestay.response';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatStateService } from '../../../core/services/chat/chat-state.service';

@Component({
  selector: 'app-homestay-item',
  imports: [CommonModule, RouterModule],
  templateUrl: './homestay-item.html',
  styleUrl: './homestay-item.css',
})
export class HomestayItem implements OnInit, OnDestroy {
  @Input() homestay!: HomestayResponse;
  @Input() layoutType: number = 0;
  coverImage: string = '';

  currentImgIndex = signal(0);
  private intervalId: any;

  constructor(private cdr: ChangeDetectorRef, private chatStateService: ChatStateService) { }

  ngOnInit() {
    this.setCoverImage();



  }

  
  private setCoverImage() {
    if (this.homestay?.imageUrls && this.homestay.imageUrls.length > 0) {
      this.coverImage = this.homestay.imageUrls[0];
    } else {
      this.coverImage = 'assets/images/homestay-placeholder.jpg';
    }
  }

  startImageSequence() {
    if (!this.homestay?.imageUrls || this.homestay.imageUrls.length <= 1) return;
    if (this.intervalId) return;

    // CHUẨN APP HIỆN ĐẠI: 1.5 giây đổi ảnh 1 lần
    this.intervalId = setInterval(() => {
      this.currentImgIndex.update(idx => (idx + 1) % this.homestay.imageUrls.length);
      this.cdr.markForCheck();
    }, 1500);
  }

  stopImageSequence() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentImgIndex.set(0);
    this.cdr.markForCheck();
  }
  ngOnDestroy() {

    this.chatStateService.autoTargetHost.set(null);
  }

}