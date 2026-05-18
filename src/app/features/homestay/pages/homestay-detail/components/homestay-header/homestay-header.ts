import { ChangeDetectorRef, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { FavoriteService } from '../../../../../../core/services/favorite/favorite.service';

@Component({
  selector: 'app-homestay-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homestay-header.html',
  styleUrl: './homestay-header.css',
})
export class HomestayHeader {
  // Sử dụng inject() đời mới cho code gọn gàng
  private homestayService = inject(HomestayService);
  private favoriteService = inject(FavoriteService);
  private cdr = inject(ChangeDetectorRef);

  homestay = computed(() => this.homestayService.currentHomestay());

  onShare() {
    if (navigator.share) {
      navigator.share({
        title: this.homestay()?.name,
        url: window.location.href
      });
    }
  }


  public handleFavoriteClick(): void {
    const currentData = this.homestay();
    if (!currentData) return;

    const originalStatus = currentData.isFavorite;
    currentData.isFavorite = !originalStatus;

    this.cdr.markForCheck();

    // 2. Bắn API ngầm xuống Backend
    this.favoriteService.toggleFavoriteStatus(currentData.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Đồng bộ lại dữ liệu chuẩn từ Backend
          currentData.isFavorite = response.data;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('[FAVORITE] Failed to toggle favorite status in Header:', err);
        // Rollback: Trả lại trạng thái cũ nếu rớt mạng hoặc lỗi
        currentData.isFavorite = originalStatus;
        this.cdr.markForCheck();
      }
    });
  }
}