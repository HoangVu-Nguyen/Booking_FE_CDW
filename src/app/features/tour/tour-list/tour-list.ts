import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { TourService } from '../../../core/services/tour/tour.service';
import { TourResponse } from '../../../core/models/response/tour.response';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { TourItem } from '../tour-item/tour-item';

@Component({
  selector: 'app-tour-list',
  standalone: true, // Nếu bạn đang dùng standalone
  imports: [TourItem, CurrencyPipe, CommonModule],
  templateUrl: './tour-list.html',
  styleUrl: './tour-list.css',
})
export class TourList implements OnInit {
  private tourService = inject(TourService);
  
  tours = signal<TourResponse[]>([]);
  currentPage = signal(0);
  
  isLoading = signal(false);
  hasMore = signal(true); 

  ngOnInit(): void {
    this.loadTours(); // Tải trang đầu tiên khi vào web
  }

  loadTours(): void {
    if (this.isLoading() || !this.hasMore()) return;

    this.isLoading.set(true); // Bật cờ đang tải

    this.tourService.getAllTours(this.currentPage(), 10).subscribe({
      next: (res) => {
        console.log(res)
        if (res.success && res.data) {
          const newTours = res.data.content;
          
          this.tours.update(currentTours => [...currentTours, ...newTours]);

          if (this.currentPage() >= res.data.totalPages - 1 || newTours.length === 0) {
            this.hasMore.set(false);
          } else {
            this.currentPage.update(page => page + 1);
          }
        }
        this.isLoading.set(false); 
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    // Lấy chiều cao của cửa sổ, tài liệu và vị trí cuộn hiện tại
    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;

    // Nếu người dùng cuộn cách đáy trang khoảng 200px -> Gọi load thêm
    if (windowBottom >= docHeight - 200) {
      this.loadTours();
    }
  }
}