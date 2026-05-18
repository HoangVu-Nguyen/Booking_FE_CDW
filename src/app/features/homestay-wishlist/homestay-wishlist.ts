import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../../core/services/favorite/favorite.service';
import { HomestayCardResponse } from '../../core/models/response/homestay-card.response';


@Component({
  selector: 'app-homestay-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homestay-wishlist.html',
  styleUrl: './homestay-wishlist.css',
})
export class HomestayWishlist implements OnInit {
  private favoriteService = inject(FavoriteService);
  private cdr = inject(ChangeDetectorRef);

  // Quản lý mảng danh sách bộ sưu tập động bằng Signal
  public collections = signal<HomestayCardResponse[]>([]);
  public isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadMyCollection();
  }

  /**
   * Kéo dữ liệu bộ sưu tập Slim Card từ Backend về
   */
  private loadMyCollection(): void {
    this.isLoading.set(true);
    this.favoriteService.getMyCollection().subscribe({
      next: (response) => {
        if (response.success) {
          this.collections.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[WISHLIST] Thất bại khi lấy dữ liệu bộ sưu tập:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Xử lý click trái tim (Bỏ thích) trực tiếp tại màn hình danh sách bộ sưu tập
   */
  public handleFavoriteClick(item: HomestayCardResponse, event: Event): void {
    event.stopPropagation(); // Chặn đứng nhảy link router

    const originalList = this.collections();
    
    // OPTIMISTIC UI: Lọc bỏ ngay cái card vừa bấm ra khỏi danh sách để tạo cảm giác phản hồi tức thì
    this.collections.set(originalList.filter(h => h.id !== item.id));

    this.favoriteService.toggleFavoriteStatus(item.id).subscribe({
      next: (response) => {
        // Nếu Backend trả về false (nghĩa là đã Unlike thành công) -> Giữ nguyên trạng thái đã lọc
        if (response.success) {
          // Trường hợp hy hữu Backend báo vẫn thích (Re-added) -> Hoàn tác
          this.loadMyCollection();
        }
      },
      error: (err) => {
        console.error('[WISHLIST] Không thể cập nhật trạng thái yêu thích:', err);
        // ROLLBACK: Nếu lỗi mạng, hồi phục lại danh sách cũ cho khách
        this.collections.set(originalList);
      }
    });
  }
}