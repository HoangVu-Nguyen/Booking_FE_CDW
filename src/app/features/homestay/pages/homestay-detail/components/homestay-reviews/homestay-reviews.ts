import { Component, Input, OnInit, signal, computed, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomestayReviewItem } from './components/homestay-review-item/homestay-review-item';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { ReviewResponse } from '../../../../../../core/models/response/review.response';
@Component({
  selector: 'app-homestay-reviews',
  standalone: true,
  imports: [CommonModule, HomestayReviewItem],
  templateUrl: './homestay-reviews.html',
  styleUrl: './homestay-reviews.css',
})
export class HomestayReviews implements OnInit, OnChanges {
  @Input({ required: true }) homestayId!: number;

  reviews = signal<ReviewResponse[]>([]);
  totalCount = signal(0);
  averageRating = signal(0);
  
  currentPage = 0;
  pageSize = 4;
  isLoading = signal(false);
  isLastPage = signal(false);

  constructor(private homestayService: HomestayService) {}

  // Lifecycle hook này chạy mỗi khi @Input homestayId thay đổi
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['homestayId'] && !changes['homestayId'].firstChange) {
      this.resetAndLoad();
    }
  }

  ngOnInit(): void {
    this.loadMore();
  }

  private resetAndLoad(): void {
    // 1. Dọn dẹp dữ liệu cũ ngay lập tức
    this.reviews.set([]);
    this.totalCount.set(0);
    this.averageRating.set(0);
    
    // 2. Reset các thông số phân trang
    this.currentPage = 0;
    this.isLastPage.set(false);
    
    // 3. Tải dữ liệu cho ID mới
    this.loadMore();
  }

  loadMore(): void {
    if (this.isLoading() || this.isLastPage()) return;

    this.isLoading.set(true);
    this.homestayService.getReviewsByHomestay(this.homestayId, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          console.log(res)
          this.reviews.update(current => [...current, ...res.data.content]);
          this.totalCount.set(res.data.totalElements);
          this.averageRating.set(res.data.averageRating || 0);
          this.isLastPage.set(res.data.last);
          this.currentPage++;
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          if (this.currentPage === 0) this.reviews.set([]); 
        }
      });
  }
}