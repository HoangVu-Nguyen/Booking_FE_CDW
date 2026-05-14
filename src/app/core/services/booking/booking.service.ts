import { Injectable, signal, computed } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { RoomResponse } from "../../models/response/room.response";
import { TourResponse } from "../../models/response/tour.response";
import { BookingInitRequest } from "../../models/request/booking.request";
import { BookingInitResponse } from "../../models/response/booking.response";

@Injectable({ providedIn: 'root' })
export class BookingService {
    // --- STATE CHÍNH ---
    checkInDate = signal<Date | null>(null);
    checkOutDate = signal<Date | null>(null);
    searchGuests = signal<number>(2);
    checkoutData = signal<any | null>(null);
    
    // --- STATE GIỎ HÀNG ---
    currentSelection = signal<RoomResponse | null>(null);
    currentSelectedPlan = signal<any | null>(null);
    selectedRoomCount = signal<number>(1);
    
    // Đổi default thành mảng rỗng để dễ thao tác
    currentTourSelections = signal<TourResponse[]>([]); 

    // --- COMPUTED (TÍNH TOÁN TỰ ĐỘNG CHO Ô TÍNH TIỀN) ---
    nights = computed(() => {
        const start = this.checkInDate();
        const end = this.checkOutDate();
        if (!start || !end) return 0;
        const diff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    });

    // 1. Tính tiền phòng = Giá gói * Số lượng phòng * Số đêm
    roomTotal = computed(() => {
        const plan = this.currentSelectedPlan();
        const count = this.selectedRoomCount();
        const n = this.nights();
        
        if (!plan || n === 0) return 0;
        return plan.price * count * n;
    });

    // 2. Tính tiền Tour = Tổng (Giá tour * Số lượng khách)
    tourTotal = computed(() => {
        const tours = this.currentTourSelections();
        const guests = this.searchGuests(); // Giả định mua tour cho tất cả khách
        
        if (tours.length === 0) return 0;
        
        // Cú pháp reduce để tính tổng mảng. Bác thay 'pricePerPerson' bằng field thực tế của bác nhé
        return tours.reduce((sum, tour) => sum + ((tour.pricePerPerson || 0) * guests), 0);
    });

    // 3. Tổng cộng (Tiền phòng + Tiền tour)
    grandTotal = computed(() => {
        return this.roomTotal() + this.tourTotal();
    });

    constructor(private apiService: ApiService) { }

    // --- ACTIONS ---
    selectPlan(room: RoomResponse, plan: any, count: number) {
        this.currentSelection.set(room);
        this.currentSelectedPlan.set(plan);
        this.selectedRoomCount.set(count);
    }

    selectRoomCount(count: number) {
        this.selectedRoomCount.set(count);
    }

    // Nâng cấp: Hàm Toggle Tour (Click thêm, click lại thì xóa)
    toggleTour(tour: TourResponse) {
        this.currentTourSelections.update(tours => {
            const isSelected = tours.some(t => t.id === tour.id);
            if (isSelected) {
                // Nếu đã chọn rồi thì gỡ ra
                return tours.filter(t => t.id !== tour.id);
            } else {
                // Nếu chưa chọn thì thêm vào mảng
                return [...tours, tour];
            }
        });
    }

    resetDates() {
        this.checkInDate.set(null);
        this.checkOutDate.set(null);
        this.clearSelection();
    }

    clearSelection() {
        this.currentSelection.set(null);
        this.currentSelectedPlan.set(null);
        this.selectedRoomCount.set(1);
        this.currentTourSelections.set([]); // Reset cả tour
    }

    // --- API CALLS ---
    getUnavailableDates(homestayId: number, month: number, year: number): Observable<string[]> {
        const url = `/api/v1/bookings/homestays/${homestayId}/unavailable-dates?month=${month}&year=${year}`;
        return this.apiService.get<ApiResponse<string[]>>(url).pipe(
            map(response => response.success ? response.data : [])
        );
    }
    initBooking(payload: BookingInitRequest): Observable<ApiResponse<BookingInitResponse>> {
        return this.apiService.post<ApiResponse<BookingInitResponse>>('/api/v1/bookings/init', payload);
    }
    getBookingDetails(bookingCode: string): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>(`/api/v1/bookings/${bookingCode}`);
}
}