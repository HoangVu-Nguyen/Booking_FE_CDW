import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ApiResponse } from '../../models/response/api.response';
import { UpdateHomestayAmenitiesRequest, RoomAmenityHighlightResponse, RoomAmenityHighlightRequest, UpdateRoomAmenityHighlightsRequest } from '../../models/amenitie/amenities.model';
import { AmenityResponse } from '../../models/response/homestay.response';
import { RatePlanBenefitRequest } from '../../models/request/amenity.request';



@Injectable({
  providedIn: 'root'
})
export class AmenityService {


  constructor(private apiService: ApiService) {}

  /**
   * Lấy toàn bộ tiện nghi master.
   * API: GET /api/v1/host/homestays/amenities
   */
  getAllAmenities(): Observable<ApiResponse<AmenityResponse[]>> {
    const endpoint = `/api/v1/host/homestays/amenities`;

    return this.apiService.get<ApiResponse<AmenityResponse[]>>(endpoint);
  }

  /**
   * Lấy danh sách amenityId đã chọn của homestay.
   * API: GET /api/v1/host/homestays/{homestayId}/amenities
   */
  getHomestayAmenityIds(
    homestayId: number
  ): Observable<ApiResponse<number[]>> {
    const endpoint = `/api/v1/host/homestays/${homestayId}/amenities`;

    return this.apiService.get<ApiResponse<number[]>>(endpoint);
  }

  /**
   * Cập nhật tiện nghi chung của homestay.
   * API: PUT /api/v1/host/homestays/{homestayId}/amenities
   */
  updateHomestayAmenities(
    homestayId: number,
    amenityIds: number[]
  ): Observable<ApiResponse<any>> {
    const endpoint = `/api/v1/host/homestays/${homestayId}/amenities`;

    const payload: UpdateHomestayAmenitiesRequest = {
      amenityIds
    };

    return this.apiService.put<ApiResponse<any>>(endpoint, payload);
  }

  /**
   * Lấy tiện nghi nổi bật của phòng.
   * API: GET /api/v1/host/homestays/{homestayId}/rooms/{roomId}/amenity-highlights
   */
  getRoomAmenityHighlights(
    homestayId: string,
    roomId: number
  ): Observable<ApiResponse<RoomAmenityHighlightResponse[]>> {
    const endpoint = `/api/v1/host/homestays/${homestayId}/rooms/${roomId}/amenity-highlights`;

    return this.apiService.get<ApiResponse<RoomAmenityHighlightResponse[]>>(endpoint);
  }

  /**
   * Cập nhật tiện nghi nổi bật của phòng.
   * API: PUT /api/v1/host/homestays/{homestayId}/rooms/{roomId}/amenity-highlights
   */
  updateRoomAmenityHighlights(
    homestayId: string,
    roomId: number,
    highlights: RoomAmenityHighlightRequest[]
  ): Observable<ApiResponse<any>> {
    const endpoint = `/api/v1/host/homestays/${homestayId}/rooms/${roomId}/amenity-highlights`;

    const payload: UpdateRoomAmenityHighlightsRequest = {
      highlights
    };

    return this.apiService.put<ApiResponse<any>>(endpoint, payload);
  }
  
}