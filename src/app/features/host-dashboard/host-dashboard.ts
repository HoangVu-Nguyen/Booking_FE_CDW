import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PortfolioService } from '../../core/services/manager/portfolio.service';
import { DecimalPipe } from '@angular/common';
import{CommonModule} from '@angular/common';
@Component({
  selector: 'app-host-dashboard',
  imports: [RouterModule, DecimalPipe, CommonModule],
  templateUrl: './host-dashboard.html',
  styleUrl: './host-dashboard.css',
})
export class HostDashboard {
  portfolioService = inject(PortfolioService);

  get summary() {
    return this.portfolioService.summaryData(); // Lấy dữ liệu từ Signal
  }

  ngOnInit() {
    this.portfolioService.loadSummary().subscribe();
  }
}
