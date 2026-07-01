import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ApiResponse } from '../../models/response/api.response';
import { ReviewCreateRequest } from '../../models/request/review.request';
import { BatchUploadRequest } from '../../models/request/upload.request';
import { PresignedUrlResponse } from '../../models/response/presigned-url.response';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private apiService: ApiService) {}

  prepareReviewImagesBatch(request: BatchUploadRequest): Observable<ApiResponse<PresignedUrlResponse[]>> {
    return this.apiService.post<ApiResponse<PresignedUrlResponse[]>>('/api/v1/reviews/images/prepare', request);
  }

  createReview(request: ReviewCreateRequest): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>('/api/v1/reviews', request);
  }

  checkReviewEligibility(bookingCode: string): Observable<ApiResponse<boolean>> {
    return this.apiService.get<ApiResponse<boolean>>(`/api/v1/reviews/check/${bookingCode}`);
  }
}
