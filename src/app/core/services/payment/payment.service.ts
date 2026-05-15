import { Injectable, inject } from "@angular/core";
import { Observable } from 'rxjs';
import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { HttpParams } from "@angular/common/http";

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
}