import { Injectable, signal } from "@angular/core";
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Import the map operator
import { ApiService } from "../api/api.service";
import { UserPhotoResponse } from "../../models/response/user-photo.response";
import { ApiResponse } from "../../models/response/api.response";
import { HomestayResponse } from "../../models/response/homestay.response";
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
// Trong HomestayService
getAvailableRooms(id: number, checkIn: string, checkOut: string, guests: number): Observable<ApiResponse<RoomResponse[]>> {
    // Chỉ truyền Plain Object đơn giản
    const params = {
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests.toString()
    };
        
    return this.apiService.get<ApiResponse<RoomResponse[]>>(`/api/v1/homestays/${id}/available-rooms`, params)
        .pipe(
            tap(response => {
                const currentData = this.currentHomestay(); // Dùng getter signal
                if (response.success && currentData) {
                    this.currentHomestaySignal.set({
                        ...currentData,
                        rooms: response.data
                    });
                }
            })
        );
}
}