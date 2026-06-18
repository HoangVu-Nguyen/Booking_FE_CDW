import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  signal,
  SimpleChanges
} from '@angular/core';

import { HomestayResponse } from '../../../core/models/response/homestay.response';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatStateService } from '../../../core/services/chat/chat-state.service';

@Component({
  selector: 'app-homestay-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homestay-item.html',
  styleUrl: './homestay-item.css',
})
export class HomestayItem implements OnInit, OnChanges, OnDestroy {
  @Input() homestay!: HomestayResponse;
  @Input() layoutType: number = 0;

  coverImage = 'assets/images/homestay-placeholder.jpg';

  currentImgIndex = signal(0);
  private intervalId: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private chatStateService: ChatStateService
  ) {}

  ngOnInit(): void {
    this.setCoverImage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['homestay']) {
      this.setCoverImage();
    }
  }

  private setCoverImage(): void {
    this.coverImage = this.getImageUrl(0) || 'assets/images/homestay-placeholder.jpg';

    console.log('imageUrls:', this.homestay?.imageUrls);
    console.log('coverImage:', this.coverImage);
  }

  getImageUrl(index: number): string | null {
    return this.homestay?.imageUrls?.[index] || null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/homestay-placeholder.jpg';
  }

  startImageSequence(): void {
    const imageCount = this.homestay?.imageUrls?.length || 0;

    if (imageCount <= 1) return;
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.currentImgIndex.update(idx => (idx + 1) % imageCount);
      this.cdr.markForCheck();
    }, 1500);
  }

  stopImageSequence(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.currentImgIndex.set(0);
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.stopImageSequence();
    this.chatStateService.autoTargetHost.set(null);
  }
}