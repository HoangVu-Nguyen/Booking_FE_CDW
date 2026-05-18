// Bỏ vào file: src/app/features/profile/services/trip.service.ts
import { Injectable, inject, signal, computed } from "@angular/core";
import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { TripResponse } from "../../models/response/trip.response";
import { TripDetailResponse } from "../../models/response/trip-detail.response";
import { PastTripResponse } from "../../models/response/past-trip.response";

@Injectable({ providedIn: 'root' })
export class TripService {
    private apiService = inject(ApiService);

    // 1. Core Signals để quản lý State (Trạng thái) tập trung
    private _myTrips = signal<TripResponse[]>([]); // Lưu mảng danh sách hành trình tổng từ DB trả về
    public isLoading = signal<boolean>(false);     // Trạng thái Loading khi gọi API

    // 2. Read-only Signal lộ ra ngoài cho các Component bốc ra dùng trực tiếp
    public myTrips = this._myTrips.asReadonly();
    private _currentTripDetail = signal<TripDetailResponse | null>(null);
    public currentTripDetail = this._currentTripDetail.asReadonly();
    public isDetailLoading = signal<boolean>(false);

    private _pastTrips = signal<PastTripResponse[]>([]);
    public pastTrips = this._pastTrips.asReadonly();
    public isPastTripsLoading = signal<boolean>(false);

    /**
     * 3. Hàm gọi API bốc dữ liệu hành trình từ Backend
     * 
     * Vì đã có JWT Token tự đính ở ApiService, bác chỉ cần bắn thẳng GET Request
     */
    public fetchUserTrips(): void {
        this.isLoading.set(true);

        this.apiService.get<ApiResponse<TripResponse[]>>('/api/v1/trips/my-trips')
            .subscribe({
                next: (response) => {
                    if (response && response.data) {
                        console.log('[TRIP SERVICE] Danh sách hành trình khách hàng:', response.data);
                        // Nhét mảng dữ liệu sạch vào Signal Store
                        this._myTrips.set(response.data);
                    }
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('[TRIP SERVICE] Lỗi lấy danh sách hành trình khách hàng:', err);
                    this.isLoading.set(false);
                }
            });
    }

    /**
     * 4. Tính năng Luxury bổ sung: Xóa/Hủy đơn cục bộ (Local Update)
     * Khi user bấm Hủy phòng thành công, bác gọi hàm này để cập nhật trạng thái ngay trên UI
     * mà không tốn thêm một lượt mạng để gọi lại API reload toàn bộ trang!
     */
    public updateTripStatusLocal(bookingCode: string, newStatus: 'PENDING' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'): void {
        this._myTrips.update(trips =>
            trips.map(trip =>
                trip.bookingCode === bookingCode
                    ? { ...trip, status: newStatus }
                    : trip
            )
        );
    }
    public fetchTripDetail(bookingCode: string): void {
        this.isDetailLoading.set(true);

        // Gọi API GET /api/v1/trips/{bookingCode}
        this.apiService.get<ApiResponse<TripDetailResponse>>(`/api/v1/trips/${bookingCode}`)
            .subscribe({
                next: (response) => {
                    console.log(response.data);
                    if (response && response.data) {

                        this._currentTripDetail.set(response.data); // Bơm data vào Signal
                    }
                    this.isDetailLoading.set(false);
                },
                error: (err) => {
                    console.error('[TRIP SERVICE] Lỗi lấy chi tiết hành trình:', err);
                    this.isDetailLoading.set(false);
                }
            });
    }

    // 3. Hàm dọn dẹp khi user thoát màn hình chi tiết
    public clearTripDetail(): void {
        this._currentTripDetail.set(null);
    }
     public fetchPastTrips(): void {
    this.isPastTripsLoading.set(true);

    this.apiService.get<ApiResponse<PastTripResponse[]>>('/api/v1/trips/past-trips')
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this._pastTrips.set(response.data); // Bơm mớ data thật vào Signal
          }
          this.isPastTripsLoading.set(false);
        },
        error: (err) => {
          console.error('[TRIP SERVICE] Error fetching past trips:', err);
          this.isPastTripsLoading.set(false);
        }
      });
  }
}