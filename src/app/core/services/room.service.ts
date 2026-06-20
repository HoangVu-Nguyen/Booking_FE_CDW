import { Injectable, signal, computed } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from "../models/response/api.response";
import { ApiService } from "./api/api.service";
import { PresignedUrlResponse } from "./file/file.service";
import { MultiRoomBatchUploadRequest, RoomBatchUpdateRequest } from "../models/request/room.request";
import { RatePlanBenefitResponse, RatePlanBenefitRequest } from "../models/request/amenity.request";


@Injectable({ providedIn: 'root' })
export class RoomService {
    constructor(private apiService: ApiService) {

    }

    // --- API CALLS ---
    getUnavailableDates(homestayId: number, month: number, year: number): Observable<string[]> {
        const url = `/api/v1/${homestayId}/rooms/unavailable-dates?month=${month}&year=${year}`;
        return this.apiService.get<ApiResponse<string[]>>(url).pipe(
            map(response => response.success ? response.data : [])
        );
    }

    uploadFileToS3(uploadUrl: string, file: File): Observable<any> {
        // Có thể dùng fetch API hoặc HttpClient trực tiếp (bỏ qua Interceptor)
        return new Observable(observer => {
            fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            })
                .then(response => {
                    if (response.ok) {
                        observer.next(response);
                        observer.complete();
                    } else {
                        observer.error(response);
                    }
                })
                .catch(err => observer.error(err));
        });
    }
    prepareImageUploads(payload: MultiRoomBatchUploadRequest): Observable<PresignedUrlResponse[]> {
        const url = `/api/v1/rooms/images/presign`;
        return this.apiService.post<ApiResponse<PresignedUrlResponse[]>>(url, payload).pipe(
            map(response => response.success ? response.data : [])
        );
    }

    // 4. Chốt sổ: Cập nhật thông tin text và xác nhận các ảnh đã upload
    updateRooms(homestayId:string,payload: RoomBatchUpdateRequest): Observable<any> {
        // Giả sử ông có API PUT hoặc POST để update toàn bộ
        const url = `/api/v1/${homestayId}/rooms`;
        return this.apiService.put<ApiResponse<any>>(url, payload);
    }
       
    getRatePlanBenefits(
        homestayId: number | string,
        roomId: number | string,
        ratePlanId: number | string
    ) {
        return this.apiService.get<ApiResponse<RatePlanBenefitResponse[]>>(
            `/api/v1/${homestayId}/rooms/${roomId}/rate-plans/${ratePlanId}/benefits`
        );
    }

    updateRatePlanBenefits(
        homestayId: number | string,
        roomId: number | string,
        ratePlanId: number | string,
        benefits: RatePlanBenefitRequest[]
    ) {
        return this.apiService.put<ApiResponse<void>>(
            `/api/v1/${homestayId}/rooms/${roomId}/rate-plans/${ratePlanId}/benefits`,
            { benefits }
        );
    }

}