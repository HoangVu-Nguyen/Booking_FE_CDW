import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { HostWalletInfo, WithdrawRequest, WalletTransaction } from '../../models/response/wallet.response';
import { PageResponse } from '../../models/response/page.response';
import { ApiResponse } from '../../models/response/api.response';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  
  private readonly BASE_URL = '/api/v1/host/wallet';
  private readonly ADMIN_URL = '/api/v1/admin/wallet';


  constructor(private api: ApiService) {}

  /**
   * Lấy thông tin số dư của Ví
   */
  getWalletInfo(): Observable<ApiResponse<HostWalletInfo>> {
    return this.api.get<ApiResponse<HostWalletInfo>>(this.BASE_URL);
  }

  /**
   * Đặt lệnh rút tiền
   * Lưu ý: Hiện tại Backend đang trả về ResponseEntity.ok("Yêu cầu rút tiền thành công...")
   * Để hàm .post() của bác không bị lỗi parse JSON, tốt nhất ở Backend bác nên trả về JSON kiểu:
   * ResponseEntity.ok(Map.of("message", "Thành công"));
   */
  requestWithdraw(payload: WithdrawRequest): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>(`${this.BASE_URL}/withdraw`, payload);
  }

  /**
   * Lấy lịch sử giao dịch (Có phân trang)
   */
  /**
 * Lấy lịch sử giao dịch (Có phân trang)
 */
getTransactionHistory(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<WalletTransaction>>> {
  return this.api.get<ApiResponse<PageResponse<WalletTransaction>>>(`${this.BASE_URL}/transactions`, { page, size });
}

  getPendingWithdrawals(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<WalletTransaction>>> {
    return this.api.get<ApiResponse<PageResponse<WalletTransaction>>>(`${this.ADMIN_URL}/withdrawals/pending`, { page, size });
  }

  resolveWithdrawal(transactionId: number, status: 'COMPLETED' | 'FAILED', adminComment: string = ''): Observable<ApiResponse<any>> {
    const payload = {
      transactionId,
      status,
      adminComment
    };
    return this.api.post<ApiResponse<any>>(`${this.ADMIN_URL}/withdrawals/resolve`, payload);
  }
}