import { Component, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { SharedImageLightbox } from '../../../../../../shared/components/shared-image-lightbox/shared-image-lightbox';
import { LightboxImage } from '../../../../../../core/models/image/image.model';

@Component({
  selector: 'app-homestay-gallery',
  standalone: true,
  imports: [CommonModule, SharedImageLightbox],
  templateUrl: './homestay-gallery.html',
  styleUrl: './homestay-gallery.css',
})
export class HomestayGallery {
  @ViewChild('lightbox') lightbox!: SharedImageLightbox;

  homestay = computed(() => this.homestayService.currentHomestay());

  galleryImages = computed(() => {
    const images = this.homestay()?.imageUrls ?? [];
    const placeholder = 'assets/images/placeholder-luxury.jpg';

    return {
      exterior: images[0] || placeholder,
      interior: images[1] || placeholder,
      wellness: images[2] || placeholder,
      atmosphere: images[3] || placeholder,
      totalCount: images.length
    };
  });

  constructor(private homestayService: HomestayService) {}

  openHomestayGallery(): void {
    const homestay = this.homestay();

    if (!homestay?.imageUrls?.length) {
      return;
    }

    const lightboxData: LightboxImage[] = homestay.imageUrls.map(url => ({
      url,
      caption: 'Tổng quan Homestay'
    }));

    this.lightbox.open(lightboxData, 0);
  }
}