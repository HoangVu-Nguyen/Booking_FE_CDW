import { Injectable, signal, computed } from "@angular/core";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from "../models/response/api.response";
import { ApiService } from "./api/api.service";


@Injectable({ providedIn: 'root' })
export class RoomService {
    constructor(private apiService: ApiService) {

    }

    // --- API CALLS ---
    getUnavailableDates(homestayId: number, month: number, year: number): Observable<string[]> {
        const url = `/api/v1/rooms/homestays/${homestayId}/unavailable-dates?month=${month}&year=${year}`;
        return this.apiService.get<ApiResponse<string[]>>(url).pipe(
            map(response => response.success ? response.data : [])
        );
    }


}