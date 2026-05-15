import { Injectable, signal, computed, inject } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http"; // Import thêm để xử lý text response

import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { RoomResponse } from "../../models/response/room.response";
import { TourResponse } from "../../models/response/tour.response";
import { BookingInitRequest } from "../../models/request/booking.request";
import { BookingInitResponse } from "../../models/response/booking.response";

// booking.service.ts

@Injectable({ providedIn: 'root' })
export class BookingService {
    // Chỉ cần inject ApiService là đủ cân cả thế giới
    private apiService = inject(ApiService);

    // --- STATE & COMPUTED (Giữ nguyên logic cực chuẩn của bác) ---
    checkInDate = signal<Date | null>(null);
    checkOutDate = signal<Date | null>(null);
    searchGuests = signal<number>(2);
    checkoutData = signal<any | null>(null);
    currentSelection = signal<RoomResponse | null>(null);
    currentSelectedPlan = signal<any | null>(null);
    selectedRoomCount = signal<number>(1);
    currentTourSelections = signal<TourResponse[]>([]);

    nights = computed(() => {
        const start = this.checkInDate();
        const end = this.checkOutDate();
        if (!start || !end) return 0;
        const diff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    });

    roomTotal = computed(() => {
        const plan = this.currentSelectedPlan();
        const n = this.nights();
        return (plan && n > 0) ? plan.price * this.selectedRoomCount() * n : 0;
    });

    tourTotal = computed(() => {
        const tours = this.currentTourSelections();
        return tours.reduce((sum, tour) => sum + ((tour.pricePerPerson || 0) * this.searchGuests()), 0);
    });

    serviceFee = computed(() => (this.roomTotal() + this.tourTotal()) * 0.1);
    grandTotal = computed(() => this.roomTotal() + this.tourTotal() + this.serviceFee());

    // --- ACTIONS (Select, Toggle, Clear...) ---
    selectPlan(room: RoomResponse, plan: any, count: number) {
        this.currentSelection.set(room);
        this.currentSelectedPlan.set(plan);
        this.selectedRoomCount.set(count);
    }

    toggleTour(tour: TourResponse) {
        this.currentTourSelections.update(tours => {
            const isSelected = tours.some(t => t.id === tour.id);
            return isSelected ? tours.filter(t => t.id !== tour.id) : [...tours, tour];
        });
    }

    clearSelection() {
        this.currentSelection.set(null);
        this.currentSelectedPlan.set(null);
        this.selectedRoomCount.set(1);
        this.currentTourSelections.set([]);
    }

    // --- API CALLS (Bú data từ ApiService) ---
    getUnavailableDates(homestayId: number, month: number, year: number): Observable<string[]> {
        return this.apiService.get<ApiResponse<string[]>>(`/api/v1/bookings/homestays/${homestayId}/unavailable-dates`, { month, year }).pipe(
            map(res => res.success ? res.data : [])
        );
    }

    initBooking(payload: BookingInitRequest): Observable<ApiResponse<BookingInitResponse>> {
        return this.apiService.post<ApiResponse<BookingInitResponse>>('/api/v1/bookings/init', payload);
    }

    getBookingDetails(bookingCode: string): Observable<ApiResponse<any>> {
        return this.apiService.get<ApiResponse<any>>(`/api/v1/bookings/${bookingCode}`);
    }

    /**
     * Lấy URL thanh toán VNPAY cực gọn thông qua hàm getText mới
     */
    getVnpayUrl(bookingCode: string): Observable<string> {
        return this.apiService.getText(`/api/v1/payments/create-vnpay-url/${bookingCode}`);
    }
    // booking.service.ts
    getPaymentUrl(bookingCode: string, method: string): Observable<string> {
        // API giờ có thêm biến method
        return this.apiService.getText(`/api/v1/payments/create-url?bookingCode=${bookingCode}&method=${method}`);
    }
}