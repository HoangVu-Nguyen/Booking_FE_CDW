import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/response/api.response';
import { ApiService } from '../api/api.service';
import { HostPendingResponse } from '../../models/host/host-pending.response';
import { HostKycDetailResponse } from '../../models/host/host-kyc-detail.response';
import { PageResponse } from '../../models/response/page.response';
import { AdminHostResponse, AdminUserListResponse } from '../../models/response/admin.reponse';
import { HttpParams } from '@angular/common/http';
import { HostDetailResponse } from '../../models/response/host-detail.response';
import { HostOverviewMetricsResponse } from '../../models/response/host-metrics.response';
import { StatusUpdateRequest } from '../../models/request/status-update.request';
import { DashboardResponse } from '../../models/dashboard-response.model';

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
  public getHostDetail(hostId: string): Observable<ApiResponse<HostDetailResponse>> {
    return this.apiService.get<ApiResponse<HostDetailResponse>>(`/api/v1/admin/approvals/hosts/${hostId}`);
  }
  public getHostOverviewMetrics(): Observable<ApiResponse<HostOverviewMetricsResponse>> {
    return this.apiService.get<ApiResponse<HostOverviewMetricsResponse>>('/api/v1/admin/approvals/hosts/metrics');
  }
  public updatePropertyStatus(homestayId: string, status: string, reason: string): Observable<ApiResponse<void>> {
    const payload: StatusUpdateRequest = { status, reason };
    return this.apiService.post<ApiResponse<void>>(
      `/api/v1/admin/approvals/properties/${homestayId}/status`, 
      payload
    );
  }
public getDashboardSummary(): Observable<ApiResponse<DashboardResponse>> {
    return this.apiService.get<ApiResponse<DashboardResponse>>('/api/v1/admin/approvals/dashboard/summary');
}
public getRevenueReport(type: string): Observable<ApiResponse<any>> {
    // Chỉ cần truyền object đơn giản { type: type }
    return this.apiService.get<ApiResponse<any>>(
        '/api/v1/admin/approvals/revenue', 
        { type: type } 
    );
}
public suspendHost(hostId: string | number, reason: string, days: number): Observable<ApiResponse<void>> {
    const payload = { reason, days };
    return this.apiService.patch<ApiResponse<void>>(
        `/api/v1/admin/approvals/hosts/${hostId}/suspend`, 
        payload
    );
}

  public getAdminUsers(keyword: string = '', role: string = 'ALL', status: string = 'ALL', page: number = 0, size: number = 10): Observable<ApiResponse<AdminUserListResponse>> {
    return this.apiService.get<ApiResponse<AdminUserListResponse>>('/api/v1/admin/users', { keyword, role, status, page, size });
  }

  public toggleUserStatus(userId: number): Observable<ApiResponse<void>> {
    return this.apiService.put<ApiResponse<void>>(`/api/v1/admin/users/${userId}/toggle-status`, {});
  }
}