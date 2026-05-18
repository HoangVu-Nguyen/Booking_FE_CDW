import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/response/api.response'; // Đường dẫn chuẩn của bác
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
      constructor(private apiService: ApiService) { }
  

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
}