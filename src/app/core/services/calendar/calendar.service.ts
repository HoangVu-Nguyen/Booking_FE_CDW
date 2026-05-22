import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { CalendarRoomResponse } from '../../models/response/calendar.response';
import { ApiResponse } from '../../models/response/api.response';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  
  constructor(private apiService: ApiService) {}

  /**
   * Gọi API qua Base ApiService
   */
  getCalendarData(
    homestayId: number, 
    startDate: string, 
    endDate: string
  ): Observable<ApiResponse<CalendarRoomResponse[]>> {
    
    // API định nghĩa ở Controller: /api/v1/host/homestays/{homestayId}/calendar
    const endpoint = `/api/v1/host/homestays/${homestayId}/calendar`;
    
    // Params sẽ được ApiService tự động xử lý thành ?startDate=...&endDate=...
    const params = {
      startDate: startDate,
      endDate: endDate
    };

    return this.apiService.get<ApiResponse<CalendarRoomResponse[]>>(endpoint, params);
  }
}