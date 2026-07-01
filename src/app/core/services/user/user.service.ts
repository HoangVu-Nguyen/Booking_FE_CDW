import { Injectable, signal } from "@angular/core";
import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { UserHeaderResponse } from "../../models/response/user-header.response";

@Injectable({ providedIn: 'root' })
export class UserService {
    // 1. Khai báo Signal chứa dữ liệu Header (Mặc định là null khi chưa có data)
    public userHeader = signal<UserHeaderResponse | null>(null);

    constructor(private apiService: ApiService) { }

    /**
     * 2. Hàm gọi API: Chỉ cần gọi 1 lần (ví dụ ở HeaderComponent lúc khởi chạy).
     * Khi có kết quả, nó sẽ tự động nhét data vào Signal.
     */
    public fetchHeaderInfo(): void {
        this.apiService.get<ApiResponse<UserHeaderResponse>>(`/api/v1/users/header`)
            .subscribe({
                next: (response) => {
                    if (response && response.data) {
                        // Cập nhật toàn bộ data vào Signal
                        this.userHeader.set(response.data);
                    }
                },
                error: (err) => {
                    console.error('[USER SERVICE] Lỗi lấy thông tin Header:', err);
                }
            });
    }

    /**
     * 3. Hàm cập nhật cục bộ (Tùy chọn cực hay):
     * Dùng khi bác đổi avatar hoặc đổi tên ở trang Profile, 
     * gọi hàm này update thẳng Signal mà KHÔNG CẦN gọi lại API lấy cục data mới.
     */
    public updateHeaderLocal(partialData: Partial<UserHeaderResponse>): void {
        this.userHeader.update(currentData => {
            if (currentData) {
                // Trộn data cũ và data mới bị thay đổi
                return { ...currentData, ...partialData };
            }
            return null;
        });
    }

    public changePassword(payload: { currentPassword: string, newPassword: string }) {
        return this.apiService.put<ApiResponse<void>>(`/api/v1/users/password`, payload);
    }
}