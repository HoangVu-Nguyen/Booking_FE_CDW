import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { CalendarInventoryResponse, CalendarRoomResponse, HomestayCalendarResponse } from '../../models/response/calendar.response';
import { ApiResponse } from '../../models/response/api.response';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(private apiService: ApiService) { }

  /**
   * Gọi API qua Base ApiService
   */
  getCalendarData(
    homestayId: number,
    startDate: string,
    endDate: string
  ): Observable<ApiResponse<HomestayCalendarResponse>> {

    // API định nghĩa ở Controller: /api/v1/host/homestays/{homestayId}/calendar
    const endpoint = `/api/v1/host/homestays/${homestayId}/calendar`;

    // Params sẽ được ApiService tự động xử lý thành ?startDate=...&endDate=...
    const params = {
      startDate: startDate,
      endDate: endDate
    };

    return this.apiService.get<ApiResponse<HomestayCalendarResponse>>(endpoint, params);
  }
  updateBatchCalendar(payload: any): Observable<ApiResponse<any>> {
    // API định nghĩa ở Controller: /api/v1/host/batch-update
    const endpoint = `/api/v1/host/homestays/calendar/batch-update`;

    // ApiService thường sử dụng phương thức post để truyền body phức tạp
    return this.apiService.post<ApiResponse<any>>(endpoint, payload);
  }
  getCalendarDetails(homestayId: number, roomId: number, startDate: string, endDate: string): Observable<ApiResponse<CalendarInventoryResponse[]>> {
    const endpoint = `/api/v1/host/homestays/${homestayId}/calendar/details`;
    const params = {
      roomId: roomId,
      startDate: startDate,
      endDate: endDate
    };
    return this.apiService.get<ApiResponse<CalendarInventoryResponse[]>>(endpoint, params);
  }
}