import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../../core/services/manager/portfolio.service';
import { PropertySummaryResponse } from '../../../../core/models/response/property.response';
// Chú ý: Cập nhật lại đường dẫn import cho đúng với cấu trúc thư mục của bạn


@Component({
  selector: 'app-host-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.html'
})
export class Portfolio implements OnInit {
  private portfolioService = inject(PortfolioService);


  get properties(): PropertySummaryResponse[] {
    return this.portfolioService.propertiesData();
  }

  get isLoading(): boolean {
    return this.portfolioService.loadingProperties();
  }

  ngOnInit() {
    this.portfolioService.loadProperties().subscribe();
  }

  getStatusConfig(status: string) {
    const configs: any = {
      'ACTIVE': { bg: 'bg-emerald-500/90', text: 'text-white', icon: 'check_circle', label: 'Đang hoạt động' },
      'MAINTENANCE': { bg: 'bg-amber-500/90', text: 'text-white', icon: 'build', label: 'Bảo trì' },
      'DRAFT': { bg: 'bg-stone-500/90', text: 'text-white', icon: 'edit_document', label: 'Bản nháp' },
      'CLOSED': { bg: 'bg-rose-500/90', text: 'text-white', icon: 'cancel', label: 'Đã đóng' } // Thêm trạng thái đóng
    };
    return configs[status] || configs['DRAFT']; 
  }
}