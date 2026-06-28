import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/response/api.response';
import { ApiService } from '../api/api.service';
import { HostPendingResponse } from '../../models/host/host-pending.response';
import { HostKycDetailResponse } from '../../models/host/host-kyc-detail.response';

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
}