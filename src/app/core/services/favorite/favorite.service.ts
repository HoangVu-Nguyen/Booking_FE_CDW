import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/response/api.response'; // Đường dẫn chuẩn của bác
import { ApiService } from '../api/api.service';
import { HomestayCardResponse } from '../../models/response/homestay-card.response'; // Import DTO phẳng mới vào

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  // Sử dụng inject() phẳng, bứng hoàn toàn constructor đi cho chuẩn bài Angular hiện đại
  private apiService = inject(ApiService);

  /**
   * Toggles the favorite status of a homestay.
   * Returns true if added (Tim đỏ), false if removed (Tim trắng).
   */
  public toggleFavoriteStatus(homestayId: number): Observable<ApiResponse<boolean>> {
    return this.apiService.post<ApiResponse<boolean>>(
      `/api/v1/favorites/homestays/${homestayId}/toggle`, 
      {}
    );
  }

  /**
   * Kéo toàn bộ danh sách bộ sưu tập dạng Slim Card DTO của User về
   * Đồng bộ 100% với hàm getMyCuratedCollection() dưới Backend
   */
  public getMyCollection(): Observable<ApiResponse<HomestayCardResponse[]>> {
    return this.apiService.get<ApiResponse<HomestayCardResponse[]>>(
      '/api/v1/favorites/my-collection'
    );
  }
}