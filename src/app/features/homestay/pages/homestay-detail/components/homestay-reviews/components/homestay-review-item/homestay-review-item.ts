import { Component, Input, OnInit } from '@angular/core';
import { ReviewResponse } from '../../../../../../../../core/models/response/review.response';
import { CommonModule, DatePipe } from '@angular/common'; // Thêm DatePipe
@Component({
  selector: 'app-homestay-review-item',
  imports: [CommonModule],
  templateUrl: './homestay-review-item.html',
  styleUrl: './homestay-review-item.css',
})
export class HomestayReviewItem implements OnInit {
  ngOnInit(): void {
    console.log(this.review.imageUrls)
  }
  @Input({ required: true }) review!: ReviewResponse;
  @Input({ required: true }) index!: number;

  getInitials(name: string | undefined): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
  handleImageError(event: any) {
  console.log('Không load được ảnh:', event.target.src);
  // Có thể set ảnh mặc định nếu link die
  event.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500';
}
}
