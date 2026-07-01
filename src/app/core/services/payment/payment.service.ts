import { Injectable, inject } from "@angular/core";
import { firstValueFrom, Observable } from 'rxjs';
import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { HttpParams } from "@angular/common/http";
import { UserPaymentMethod } from "../../models/payment/user-payment-method.model";

@Injectable({ providedIn: 'root' })
export class PaymentService {
    // Dùng inject() cho đồng bộ với phong cách Angular hiện đại nếu thích, 
    // hoặc giữ nguyên constructor của bác đều chạy ngon.
    private apiService = inject(ApiService);

    /**
     * Gửi toàn bộ queryParams trả về từ VNPAY/MoMo xuống API Return của Backend để verify chữ ký số và lấy data sạch
     * @param gateway 'vnpay' hoặc 'momo'
     * @param queryParams Object chứa toàn bộ tham số dính trên URL (?vnp_Amount=...&vnp_ResponseCode=...)
     */
    verifyPayment(gateway: string, queryParams: any): Observable<ApiResponse<any>> {
  // 1. Tạo một Object thuần (Plain Object) thay vì HttpParams
  const cleanParams: any = {};
  
  // 2. Chỉ lọc và nhặt đúng những tham số gốc từ URL của VNPAY/MoMo bỏ vào
  if (queryParams) {
    Object.keys(queryParams).forEach(key => {
      const value = queryParams[key];
      if (value !== null && value !== undefined && value !== '') {
        // Giữ nguyên chính xác chữ Hoa / chữ Thường của Key gốc
        cleanParams[key] = String(value);
      }
    });
  }

  // 3. Gọi qua ApiService bọc sẵn của bác bằng Object thuần
  return this.apiService.get<any>(`/api/v1/payments/${gateway}/return`, cleanParams);
}
// 1. Lấy toàn bộ thẻ của User hiện tại
  getPaymentMethods(): Promise<ApiResponse<UserPaymentMethod[]>> {
    return firstValueFrom(this.apiService.get<ApiResponse<UserPaymentMethod[]>>('/api/v1/payments'));
  }

  // 2. Thiết lập thẻ mặc định (Primary)
  setPrimaryCard(id: number): Promise<ApiResponse<void>> {
    return firstValueFrom(this.apiService.patch<ApiResponse<void>>(`/api/v1/payments/${id}/primary`));
  }

  // 3. Xóa/Hủy liên kết thẻ
  deleteCard(id: number): Promise<ApiResponse<void>> {
    return firstValueFrom(this.apiService.delete<ApiResponse<void>>(`/api/v1/payments/${id}`));
  }
  // 4. Lấy Client Secret từ Stripe SetupIntent (Mới thêm)
  createSetupIntent(): Promise<ApiResponse<string>> {
    return firstValueFrom(this.apiService.post<ApiResponse<string>>('/api/v1/payments/setup-intent', {}));
  }

  // 5. Gửi mã Token và tên chủ thẻ về BE để lưu DB (Khớp chuẩn DTO Request)
  confirmPaymentMethod(body: { paymentMethodId: string; cardHolderName: string }): Promise<ApiResponse<void>> {
    return firstValueFrom(this.apiService.post<ApiResponse<void>>('/api/v1/payments/confirm', body));
  }
  // Xác nhận thanh toán đơn hàng (Hỗ trợ cả VNPAY, MOMO, TRANSFER và CARD_xxx)
  confirmCheckout(body: { bookingCode: string; paymentMethod: string; userVoucherId?: number | null }): Promise<ApiResponse<any>> {
    return firstValueFrom(this.apiService.post<ApiResponse<any>>('/api/v1/payments/checkout/confirm', body));
  }
  getPaymentSuccessDetails(bookingCode: string): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>(`/api/v1/payments/success-details/${bookingCode}`);
  }
}