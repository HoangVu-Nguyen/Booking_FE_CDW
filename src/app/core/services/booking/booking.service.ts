import { Injectable, signal, computed } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { RoomResponse } from "../../models/response/room.response";

@Injectable({ providedIn: 'root' })
export class BookingService {
    // --- STATE ---
    checkInDate = signal<Date | null>(null);
    checkOutDate = signal<Date | null>(null);
    searchGuests = signal(2);
    
    // Tách riêng Phòng, Gói và Số lượng
    currentSelection = signal<RoomResponse | null>(null);
    currentSelectedPlan = signal<any | null>(null);
    selectedRoomCount = signal<number>(1);

    // --- COMPUTED ---
    nights = computed(() => {
        const start = this.checkInDate();
        const end = this.checkOutDate();
        if (!start || !end) return 0;
        const diff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    });

    constructor(private apiService: ApiService) { }

    // --- ACTIONS ---
    selectPlan(room: RoomResponse, plan: any, count: number) {
        this.currentSelection.set(room);
        this.currentSelectedPlan.set(plan);
        this.selectedRoomCount.set(count);
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
    }

    // --- API CALLS ---
    getUnavailableDates(homestayId: number, month: number, year: number): Observable<string[]> {
        const url = `/api/v1/bookings/homestays/${homestayId}/unavailable-dates?month=${month}&year=${year}`;
        return this.apiService.get<ApiResponse<string[]>>(url).pipe(
            map(response => response.success ? response.data : [])
        );
    }

}