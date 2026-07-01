import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../../core/services/toast/toast.service';
import { ReviewService } from '../../../../../../core/services/review/review.service';
import { BatchUploadRequest } from '../../../../../../core/models/request/upload.request';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-booking-review-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-review-banner.html',
  styleUrl: './booking-review-banner.css',
})
export class BookingReviewBanner implements OnInit {
  @Input() bookingCode!: string;

  private toast = inject(ToastService);
  private reviewService = inject(ReviewService);
  private changeRef = inject(ChangeDetectorRef);

  isModalOpen = false;
  hoveredStar = 0;
  rating = 0;
  reviewContent = '';
  isSubmitting = false;
  selectedImages: { file: File; url: string }[] = [];

  isEligible = false;
  isChecking = true;

  ngOnInit() {
    if (this.bookingCode) {
      this.reviewService.checkReviewEligibility(this.bookingCode).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.isEligible = res.data;
            this.changeRef.markForCheck()
          } else {
            this.isEligible = false;
            this.changeRef.markForCheck()
          }
          this.isChecking = false;
          this.changeRef.markForCheck()
        },
        error: (err) => {
          console.error('Lỗi khi kiểm tra quyền đánh giá:', err);
          this.isEligible = false;
          this.isChecking = false;
        }
      });
    } else {
      this.isChecking = false;
    }
  }

  openModal() {
    this.isModalOpen = true;
    this.rating = 0;
    this.hoveredStar = 0;
    this.reviewContent = '';
    this.selectedImages = [];
  }

  closeModal() {
    this.isModalOpen = false;
  }

  setRating(star: number) {
    this.rating = star;
  }

  setHoveredStar(star: number) {
    this.hoveredStar = star;
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.match(/image\/*/)) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedImages.push({
              file: file,
              url: e.target.result
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
    event.target.value = '';
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  async submitReview() {
    if (this.rating === 0) {
      this.toast.error('Vui lòng chọn số sao', 'Đánh giá cần có số sao từ 1 đến 5.');
      return;
    }

    if (!this.reviewContent.trim()) {
      this.toast.error('Vui lòng nhập nội dung', 'Hãy chia sẻ một vài cảm nhận về chuyến đi của bạn.');
      return;
    }

    this.isSubmitting = true;

    try {
      let imageKeys: string[] = [];

      // 1. Nếu có ảnh, gọi API prepare để lấy presigned URL
      if (this.selectedImages.length > 0) {
        const batchRequest: BatchUploadRequest = {
          targetId: 0,
          items: this.selectedImages.map((img, index) => ({
            fileName: img.file.name,
            contentType: img.file.type,
            fileSize: img.file.size,
            isCover: index === 0,
            sortOrder: index,
            imageType: 'HOMESTAY'
          }))
        };

        const prepareRes = await firstValueFrom(this.reviewService.prepareReviewImagesBatch(batchRequest));

        if (prepareRes.success && prepareRes.data) {
          // 2. Upload trực tiếp từng ảnh lên S3
          const uploadPromises = prepareRes.data.map(async (presignedData, index) => {
            const file = this.selectedImages[index].file;
            const response = await fetch(presignedData.uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type
              }
            });

            if (!response.ok) {
              throw new Error(`Upload failed for file: ${file.name}`);
            }
            return presignedData.objectKey;
          });

          imageKeys = await Promise.all(uploadPromises);
        }
      }

      // 3. Gọi API submit review với imageKeys
      const reviewReq = {
        bookingCode: this.bookingCode,
        rating: this.rating,
        content: this.reviewContent,
        imageKeys: imageKeys
      };

      const submitRes = await firstValueFrom(this.reviewService.createReview(reviewReq));

      if (submitRes.success) {
        this.toast.success('Cảm ơn bạn!', 'Đánh giá của bạn đã được gửi thành công.');
        this.isEligible = false; // Ẩn banner đi sau khi đã đánh giá thành công
        this.closeModal();
      } else {
        this.toast.error('Lỗi', submitRes.message || 'Có lỗi xảy ra khi gửi đánh giá.');
      }
    } catch (error: any) {
      console.error('Lỗi khi gửi đánh giá:', error);
      this.toast.error('Lỗi', 'Không thể gửi đánh giá lúc này, vui lòng thử lại sau.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
