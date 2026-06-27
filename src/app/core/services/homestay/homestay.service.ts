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
import { RoomDisplayResponse, RoomResponse } from "../../models/response/room.response";
import { PresignedUrlResponse } from "../file/file.service";

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
    /**
     * Cập nhật thông tin Homestay
     * @param id ID của Homestay
     * @param payload Dữ liệu cập nhật (JSON)
     */
    updateHomestay(id: string | number, payload: any): Observable<ApiResponse<HomestayResponse>> {
        return this.apiService.put<ApiResponse<HomestayResponse>>(
            `/api/v1/homestays/${id}`,
            payload
        );
    }
    getRoomsByHomestayId(homestayId: number | string): Observable<ApiResponse<RoomDisplayResponse[]>> {
        const endpoint = `/api/v1/homestays/${homestayId}/rooms`;
        return this.apiService.get<ApiResponse<RoomDisplayResponse[]>>(endpoint);
    }
    /**
       * Hàm xin link upload cho nhiều phòng/homestay cùng lúc
       * Sử dụng cấu trúc MultiRoomBatchUploadRequest để linh hoạt
       */
    prepareHomestayImagesBatch(batchRequest: any): Observable<PresignedUrlResponse[]> {
        const url = `/api/v1/homestays/images/presign`;
        return this.apiService.post<ApiResponse<PresignedUrlResponse[]>>(url, batchRequest).pipe(
            map(response => response.success ? response.data : [])
        );
    }

    /**
     * Upload file vật lý lên S3 bằng fetch (Bypass Interceptor)
     */
    uploadFileToS3(uploadUrl: string, file: File): Observable<any> {
        return new Observable(observer => {
            fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type } // Quan trọng để S3 nhận đúng file
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
    /**
     * Lấy danh sách các tài liệu (Sổ đỏ, Hợp đồng...) đã upload của Homestay
     */
    getHomestayDocuments(homestayId: string): Observable<ApiResponse<any[]>> {
        return this.apiService.get<ApiResponse<any[]>>(`/api/v1/homestays/${homestayId}/documents`);
    }

    /**
     * Xin link Presigned URL để upload tài liệu lên S3
     * @param batchRequest Chứa mảng { documentType, fileName, contentType, fileSize }
     */
    prepareDocumentUploads(homestayId: string, batchRequest: any): Observable<ApiResponse<any[]>> {
        return this.apiService.post<ApiResponse<any[]>>(
            `/api/v1/homestays/${homestayId}/documents/prepare`,
            batchRequest
        );
    }

    /**
     * Xác nhận file đã được upload lên S3 thành công
     */
    confirmDocumentUpload(homestayId: string, documentId: number): Observable<ApiResponse<any>> {
        return this.apiService.patch<ApiResponse<any>>(
            `/api/v1/homestays/${homestayId}/documents/${documentId}/confirm`,
            {}
        );
    }

    /**
     * Nút chốt: Gửi Admin duyệt toàn bộ hồ sơ Homestay
     */
    submitForVerification(homestayId: string): Observable<ApiResponse<any>> {
        return this.apiService.post<ApiResponse<any>>(
            `/api/v1/homestays/${homestayId}/verify`,
            {}
        );
    }
}