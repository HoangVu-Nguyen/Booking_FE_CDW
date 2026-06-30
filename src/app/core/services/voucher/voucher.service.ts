import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ApiResponse } from '../../models/response/api.response';
import { VoucherCreateRequest } from '../../models/request/voucher.request';
import { VoucherResponse } from '../../models/response/voucher.response';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  constructor(private apiService: ApiService) {}

  createVoucher(request: VoucherCreateRequest): Observable<ApiResponse<VoucherResponse>> {
    return this.apiService.post<ApiResponse<VoucherResponse>>('/api/v1/vouchers', request);
  }

  getAllVouchers(): Observable<ApiResponse<VoucherResponse[]>> {
    return this.apiService.get<ApiResponse<VoucherResponse[]>>('/api/v1/vouchers');
  }

  getCurrentUserPoints(): Observable<ApiResponse<number>> {
    return this.apiService.get<ApiResponse<number>>('/api/v1/vouchers/points/me');
  }

  redeemVoucher(templateId: number): Observable<ApiResponse<void>> {
    return this.apiService.post<ApiResponse<void>>(`/api/v1/vouchers/${templateId}/redeem`, {});
  }
}
