import { HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class SearchApiService {
  private apiService = inject(ApiService);


 search(params: any): Observable<any> {
    // Lưu ý: Các tham số truyền vào đây sẽ được ApiService tự động chuyển thành HttpParams
    // Nếu params có mảng (amenityIds), chúng ta nên format nhẹ để Server dễ đọc
    const formattedParams = { ...params };
    
    if (Array.isArray(formattedParams.amenityIds)) {
      formattedParams.amenityIds = formattedParams.amenityIds.join(',');
    }

    // Dùng hàm GET của ApiService - cực gọn, không cần tạo HttpParams thủ công nữa
    return this.apiService.get('/api/v1/search/cinematic', formattedParams);
  }
}