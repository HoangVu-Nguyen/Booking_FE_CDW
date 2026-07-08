import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface ModeratorResponse {
  status: string;
  is_violation: boolean;
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModeratorService {
  private http = inject(HttpClient);
  private aiUrl = 'http://localhost:8007/moderate'; // URL của AI Moderator

  checkContent(text: string, files?: File[]): Observable<ModeratorResponse> {
    const formData = new FormData();
    formData.append('text_content', text || '');
    
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('images', file, file.name);
      });
    }

    return this.http.post<ModeratorResponse>(this.aiUrl, formData).pipe(
      catchError(err => {
        console.error('Lỗi khi gọi AI Moderator:', err);
        // Trả về false để không chặn luồng nếu AI sập
        return of({ status: 'error', is_violation: false, message: 'Không thể kết nối AI' } as ModeratorResponse);
      })
    );
  }
}
