// homestay-list-manager.ts
import { Component, OnInit, inject } from '@angular/core';
import { HomestayItem } from '../homestay-item/homestay-item';
import { PortfolioService } from '../../../../core/services/manager/portfolio.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-homestay-list-manager',
  standalone: true,
  imports: [HomestayItem, CommonModule], // Import component con vào đây
  templateUrl: './homestay-list-manager.html',
})
export class HomestayListManager implements OnInit {
  private service = inject(PortfolioService);
  
  // Data từ Service (Sử dụng Signal)
  portfolio = this.service.portfolioData;
  currentStartDate: Date = new Date(); // Ngày bắt đầu hiện tại

  ngOnInit() {
    this.service.loadPortfolioTimeline(5, 2026).subscribe();
    console.log('Loaded Portfolio Data:', this.portfolio()?.homes);
    this.onWeekChanged(0);
  }
onWeekChanged(direction: number) {
  // Tạo date mới (Cộng trừ 7 ngày)
  const newDate = new Date(this.currentStartDate);
  newDate.setDate(newDate.getDate() + (direction * 7));
  
  // Gán lại biến (Đây là key để Angular hiểu đã có thay đổi)
  this.currentStartDate = newDate;
  
  // Gọi lại API
  this.service.loadPortfolioTimeline(
    this.currentStartDate.getMonth() + 1, 
    this.currentStartDate.getFullYear()
  ).subscribe();
}
}