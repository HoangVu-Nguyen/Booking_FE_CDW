import { HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { PortfolioTimelineResponse } from '../../models/response/portfolio.response';
import { ApiResponse } from '../../models/response/api.response';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiService = inject(ApiService);

  // Dùng signal để lưu trữ trạng thái Portfolio
  portfolioData = signal<PortfolioTimelineResponse | null>(null);
  loading = signal<boolean>(false);

  /**
   * Gọi API Batch Timeline cho toàn bộ danh mục của Host
   */
loadPortfolioTimeline(month: number, year: number): Observable<ApiResponse<PortfolioTimelineResponse>> {
  this.loading.set(true);
  
  // Truyền Object bình thường như này thôi
  const params = { month: month.toString(), year: year.toString() };

  return this.apiService.get<ApiResponse<PortfolioTimelineResponse>>('/api/host/portfolio-timeline', params)
    .pipe(
      tap({
        next: (data) => {
            console.log('API Response:', data); 
          this.portfolioData.set(data.data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('API Error:', err);
          this.loading.set(false);
        }
      })
    );
}
}