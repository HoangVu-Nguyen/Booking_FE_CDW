import { Injectable, signal } from "@angular/core";
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from "../api/api.service";
import { UserPhotoResponse } from "../../models/response/user-photo.response";
import { ApiResponse } from "../../models/response/api.response";
import { BookingAvailabilityResponse, HomestayResponse } from "../../models/response/homestay.response";
import { PageResponse } from "../../models/response/page.response";
import { ReviewResponse } from "../../models/response/review.response";
import { HttpParams } from "@angular/common/http";
import { RoomResponse } from "../../models/response/room.response";

@Injectable({ providedIn: 'root' })
export class HomestayService {
    constructor(private apiService: ApiService) { }
    
    private currentHomestaySignal = signal<HomestayResponse | null>(null);
    readonly currentHomestay = this.currentHomestaySignal.asReadonly();

    getAllHomestays(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<HomestayResponse>>> {
        return this.apiService.get<ApiResponse<PageResponse<HomestayResponse>>>(
            `/api/v1/homestays/search?page=${page}&size=${size}`
        );
    }

    getHomestayById(id: number): Observable<ApiResponse<HomestayResponse>> {
        return this.apiService.get<ApiResponse<HomestayResponse>>(`/api/v1/homestays/${id}`)
            .pipe(
                tap(response => {
                    if (response.success) {
                        this.currentHomestaySignal.set(response.data);
                    }
                })
            );
    }
    
    getCurrentData() {
        return this.currentHomestaySignal();
    }

    getReviewsByHomestay(homestayId: number, page: number = 0, size: number = 4): Observable<ApiResponse<PageResponse<ReviewResponse>>> {
        return this.apiService.get<ApiResponse<PageResponse<ReviewResponse>>>(
            `/api/v1/reviews/homestay/${homestayId}?page=${page}&size=${size}`
        );
    }

    getAvailableRooms(id: number, checkIn: string, checkOut: string, guests: number): Observable<ApiResponse<BookingAvailabilityResponse>> {
        const params = {
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests.toString()
        };
            
        return this.apiService.get<ApiResponse<BookingAvailabilityResponse>>(`/api/v1/homestays/${id}/available-rooms`, params)
            .pipe(
                tap(response => {
                    const currentData = this.currentHomestay(); 
                    if (response.success && currentData && response.data) {
                        this.currentHomestaySignal.set({
                            ...currentData,
                            rooms: response.data.rooms, 
                            tours: response.data.suggestedTours 
                        });
                    }
                })
            );
    }

    // ========================================================
    // LUỒNG TẠO DRAFT MỚI (S3 PRESIGNED URL)
    // ========================================================

    /**
     * Bước 1: Xin cấp Presigned URLs từ Backend để upload thẳng lên S3
     * @param batchRequest Chứa list fileName, contentType, fileSize
     */
    getPresignedUrls(batchRequest: any): Observable<ApiResponse<any[]>> {
        return this.apiService.post<ApiResponse<any[]>>(
            '/api/v1/homestays/images/presign',
            batchRequest
        );
    }

    /**
     * Bước 3: Gửi JSON data tạo Homestay Draft (Sau khi ảnh đã bay lên S3 xong)
     * @param payload JSON chứa name, address, lat, lng và mảng objectKeys
     */
    createDraftHomestay(payload: any): Observable<ApiResponse<HomestayResponse>> {
        // Gửi JSON thuần túy, ApiService tự động gắn Content-Type: application/json
        return this.apiService.post<ApiResponse<HomestayResponse>>(
            '/api/v1/homestays/draft', 
            payload
        );
    }
}