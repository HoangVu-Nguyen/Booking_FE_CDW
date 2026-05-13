import { HomestayResponse } from '../../../core/models/response/homestay.response';
import { CommonModule } from '@angular/common';
import { HomestayItem } from '../homestay-item/homestay-item';
import { HomestayService } from '../../../core/services/homestay/homestay.service';
import { ChangeDetectorRef } from '@angular/core'; 
import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-homestay-list',
  standalone: true,
  imports: [CommonModule, HomestayItem],
  templateUrl: './homestay-list.html',
  styleUrl: './homestay-list.css',
})
export class HomestayList implements OnInit {
  homestaysRespone: HomestayResponse[] = [];
  currentPage = 0;
  pageSize = 10;
  isLastPage = false;
  isLoading = false;

  constructor(
    private homestayService: HomestayService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMoreHomestays();
  }

  // Lắng nghe sự kiện cuộn chuột
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Tính toán vị trí cuộn: Khoảng cách hiện tại + chiều cao màn hình >= Chiều cao toàn bộ trang - 600px (để load trước khi chạm đáy)
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 600 && !this.isLoading && !this.isLastPage) {
      this.loadMoreHomestays();
    }
  }

  loadMoreHomestays() {
    this.isLoading = true;
    
    this.homestayService.getAllHomestays(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        const newData = res.data.content;
        console.log(newData)
        
        if (newData.length > 0) {
          this.homestaysRespone = [...this.homestaysRespone, ...newData];
          this.currentPage++; // Tăng page lên cho lần gọi sau
          
          // Kiểm tra nếu đã hết dữ liệu
          if (newData.length < this.pageSize) {
            this.isLastPage = true;
          }
        } else {
          this.isLastPage = true;
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
