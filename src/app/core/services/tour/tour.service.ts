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

@Injectable({ providedIn: 'root' })
export class TourService {
    constructor(private apiService: ApiService) { }
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
}