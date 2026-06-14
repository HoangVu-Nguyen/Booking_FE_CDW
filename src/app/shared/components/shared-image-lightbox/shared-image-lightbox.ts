import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightboxImage } from '../../../core/models/image/image.model';

@Component({
  selector: 'app-shared-image-lightbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-image-lightbox.html',
  styleUrl: './shared-image-lightbox.css',
})
export class SharedImageLightbox {
  isOpen = false;
  images: LightboxImage[] = [];
  currentIndex = 0;
  isAnimating = false;

  get currentImage(): LightboxImage | null {
    return this.images.length > 0 ? this.images[this.currentIndex] : null;
  }

  open(images: LightboxImage[], startIndex: number = 0): void {
    if (!images?.length) return;

    this.images = images;
    this.currentIndex = Math.min(Math.max(startIndex, 0), images.length - 1);
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen = false;
    this.images = [];
    this.currentIndex = 0;
    document.body.style.overflow = '';
  }

  next(event?: Event): void {
    event?.stopPropagation();
    this.changeImage((this.currentIndex + 1) % this.images.length);
  }

  prev(event?: Event): void {
    event?.stopPropagation();
    this.changeImage((this.currentIndex - 1 + this.images.length) % this.images.length);
  }

  select(index: number): void {
    if (index === this.currentIndex) return;
    this.changeImage(index);
  }

  private changeImage(index: number): void {
    this.isAnimating = false;

    setTimeout(() => {
      this.currentIndex = index;
      this.isAnimating = true;
    }, 20);

    setTimeout(() => {
      this.isAnimating = false;
    }, 260);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    if (event.key === 'Escape') this.close();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }
}