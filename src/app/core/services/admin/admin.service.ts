import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/response/api.response';
import { ApiService } from '../api/api.service';
import { HostPendingResponse } from '../../models/host/host-pending.response';
import { HostKycDetailResponse } from '../../models/host/host-kyc-detail.response';
import { PageResponse } from '../../models/response/page.response';
import { AdminHostResponse } from '../../models/response/admin.reponse';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiService = inject(ApiService);

  public getPendingKycProfiles(): Observable<ApiResponse<HostPendingResponse[]>> {
    return this.apiService.get<ApiResponse<HostPendingResponse[]>>(
      '/api/v1/admin/approvals/kyc/pending'
    );
  }
  public approveKyc(profileId: number): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(`/api/v1/admin/approvals/kyc/${profileId}/approve`, {});
  }

  // Từ chối
  public rejectKyc(profileId: number, reason: string): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(`/api/v1/admin/approvals/kyc/${profileId}/reject`, { reason });
  }
  public getKycDetail(profileId: number): Observable<ApiResponse<HostKycDetailResponse>> {
    return this.apiService.get<ApiResponse<HostKycDetailResponse>>(
      `/api/v1/admin/approvals/kyc/detail/${profileId}`
    );
  }
  public countPendingKyc(): Observable<ApiResponse<number>> {
    return this.apiService.get<ApiResponse<number>>(`/api/v1/admin/approvals/kyc/count-pending`);
  }
  public getPendingProperties(): Observable<ApiResponse<any>> {
    return this.apiService.get<any>(
      '/api/v1/admin/approvals/properties/pending'
    );
  }

  public submitPropertyReview(homestayId: number, payload: any): Observable<ApiResponse<any>> {
    return this.apiService.post<any>(
      `/api/v1/admin/approvals/properties/${homestayId}/review`,
      payload
    );
  }
  public getHosts(
    keyword: string = '',
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<PageResponse<AdminHostResponse>>> {


    return this.apiService.get<ApiResponse<PageResponse<AdminHostResponse>>>(
      '/api/v1/admin/approvals/hosts',
      {
        keyword,
        page,
        size,
        sort
      }
    );
  }
}