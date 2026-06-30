import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AiChatResponse } from '../../models/response/ai-chat.response';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiService = inject(ApiService);

  public chatWithAi(userMessage: string): Observable<AiChatResponse> {
    // API backend nhận vào body là raw string
    return this.apiService.post<AiChatResponse>('/api/chat', userMessage);
  }
}
