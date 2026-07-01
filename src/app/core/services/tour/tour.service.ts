import { Injectable, signal } from "@angular/core";
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Import the map operator
import { ApiService } from "../api/api.service";
import { UserPhotoResponse } from "../../models/response/user-photo.response";
import { ApiResponse } from "../../models/response/api.response";
import { HomestayResponse } from "../../models/response/homestay.response";
import { PageResponse } from "../../models/response/page.response";
import { ReviewResponse } from "../../models/response/review.response";
import { TourResponse } from "../../models/response/tour.response";
import { TourCreateRequest } from "../../models/request/tour.request";
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { PresignedUrlResponse } from "../file/file.service";

@Injectable({ providedIn: 'root' })
export class TourService {
    private pureHttp: HttpClient;

    constructor(
        private apiService: ApiService,
        private httpBackend: HttpBackend
    ) { 
        this.pureHttp = new HttpClient(this.httpBackend);
    }
    
    private currentTourSignal = signal<TourResponse | null>(null);
    readonly currentTour = this.currentTourSignal.asReadonly();

    getAllTours(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<TourResponse>>> {
        return this.apiService.get<ApiResponse<PageResponse<TourResponse>>>(
            `/api/v1/tours?page=${page}&size=${size}`
        );
    }

    getTourById(id: number): Observable<ApiResponse<TourResponse>> {
        return this.apiService.get<ApiResponse<TourResponse>>(`/api/v1/tours/${id}`)
            .pipe(
                tap(response => {
                    if (response.data) { 
                        this.currentTourSignal.set(response.data);
                    }
                })
            );
    }

    getToursByHomestayId(homestayId: number): Observable<ApiResponse<TourResponse[]>> {
        return this.apiService.get<ApiResponse<TourResponse[]>>(`/api/v1/tours/homestay/${homestayId}/manage`);
    }

    createTour(homestayId: number, data: TourCreateRequest): Observable<ApiResponse<TourResponse>> {
        return this.apiService.post<ApiResponse<TourResponse>>(`/api/v1/tours/homestay/${homestayId}`, data);
    }

    prepareTourImageUploads(filesData: { fileName: string, contentType: string, imageType: string, fileSize: number }[]): Observable<ApiResponse<PresignedUrlResponse[]>> {
        const body = { items: filesData };
        return this.apiService.post<ApiResponse<PresignedUrlResponse[]>>('/api/v1/tours/images/prepare', body);
    }

    uploadToS3(uploadUrl: string, file: File): Observable<any> {
        const headers = new HttpHeaders({ 'Content-Type': file.type });
        return this.pureHttp.put(uploadUrl, file, { headers });
    }

    updateTour(tourId: number, data: TourCreateRequest): Observable<ApiResponse<TourResponse>> {
        return this.apiService.put<ApiResponse<TourResponse>>(`/api/v1/tours/${tourId}`, data);
    }

    deleteTour(tourId: number): Observable<ApiResponse<void>> {
        return this.apiService.delete<ApiResponse<void>>(`/api/v1/tours/${tourId}`);
    }
}