import { Component, computed } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';

@Component({
  selector: 'app-homestay-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homestay-gallery.html',
  styleUrl: './homestay-gallery.css',
})
export class HomestayGallery {
  // Lấy dữ liệu homestay hiện tại từ service
  homestay = computed(() => this.homestayService.currentHomestay());

  // Trích xuất các ảnh cụ thể cho từng vị trí trong gallery
  // Sử dụng fallback là ảnh mặc định nếu homestay chưa có đủ ảnh
  galleryImages = computed(() => {
    const images = this.homestay()?.imageUrls || [];
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
}