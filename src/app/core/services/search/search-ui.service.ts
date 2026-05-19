import { HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class SearchUiService {
  // Trạng thái bật tắt toàn cục
  public isOpen = signal<boolean>(false);
  private apiService = inject(ApiService);


  public openSearch() {
    this.isOpen.set(true);
  }

  public closeSearch() {
    this.isOpen.set(false);
  }
 search(params: any): Observable<any> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      if (value !== null && value !== undefined && value !== '') {
        // Xử lý đặc biệt cho mảng (amenityIds)
        if (Array.isArray(value)) {
          // Join mảng thành chuỗi "1,2,3" để Spring tự map sang List<Integer>
          httpParams = httpParams.append(key, value.join(','));
        } else {
          httpParams = httpParams.append(key, value.toString());
        }
      }
    });

    return this.apiService.get<any>('/api/v1/search/cinematic', { params: httpParams });
  }
}