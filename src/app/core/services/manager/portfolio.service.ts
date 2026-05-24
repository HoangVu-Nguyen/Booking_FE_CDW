import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { PortfolioTimelineResponse } from '../../models/response/portfolio.response';
import { ApiResponse } from '../../models/response/api.response';
import { PropertySummaryResponse } from '../../models/response/property.response';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiService = inject(ApiService);

  // --- QUẢN LÝ TRẠNG THÁI (STATE) BẰNG SIGNALS ---
  portfolioData = signal<PortfolioTimelineResponse | null>(null);
  propertiesData = signal<PropertySummaryResponse[]>([]); // Đã thêm Signal cho properties
  
  loadingPortfolio = signal<boolean>(false);
  loadingProperties = signal<boolean>(false); // Tách riêng loading để không bị giẫm chân nhau

  /**
   * Gọi API Batch Timeline cho toàn bộ danh mục của Host
   */
  loadPortfolioTimeline(month: number, year: number): Observable<ApiResponse<PortfolioTimelineResponse>> {
    this.loadingPortfolio.set(true);
    
    const params = { month: month.toString(), year: year.toString() };

    return this.apiService.get<ApiResponse<PortfolioTimelineResponse>>('/api/v1/host/homestays/portfolio-timeline', params)
      .pipe(
        tap({
          next: (response) => {
            console.log('API Portfolio Response:', response); 
            this.portfolioData.set(response.data);
            this.loadingPortfolio.set(false);
          },
          error: (err) => {
            console.error('API Portfolio Error:', err);
            this.loadingPortfolio.set(false);
          }
        })
      );
  }

  /**
   * Gọi API Lấy danh sách tài sản (Properties/Homestays)
   */
  loadProperties(): Observable<ApiResponse<PropertySummaryResponse[]>> {
    this.loadingProperties.set(true);

    return this.apiService.get<ApiResponse<PropertySummaryResponse[]>>('/api/v1/host/properties')
      .pipe(
        tap({
          next: (response) => {
            // Cập nhật dữ liệu vào Signal
            this.propertiesData.set(response.data || []);
            this.loadingProperties.set(false);
          },
          error: (err) => {
            console.error('API Properties Error:', err);
            this.loadingProperties.set(false);
          }
        })
      );
  }
}