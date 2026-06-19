import { Injectable, inject } from "@angular/core";
import { firstValueFrom, Observable } from 'rxjs';
import { ApiService } from "../api/api.service";
import { ApiResponse } from "../../models/response/api.response";
import { HttpParams } from "@angular/common/http";
import { UserPaymentMethod } from "../../models/payment/user-payment-method.model";
import { RatePlanBenefitRequest, RatePlanBenefitResponse } from "../../models/request/amenity.request";

@Injectable({ providedIn: 'root' })
export class RoomService {
    
    private apiService = inject(ApiService);
    getRatePlanBenefits(
        homestayId: number | string,
        roomId: number | string,
        ratePlanId: number | string
    ) {
        return this.apiService.get<ApiResponse<RatePlanBenefitResponse[]>>(
            `/api/v1/host/homestays/${homestayId}/rooms/${roomId}/rate-plans/${ratePlanId}/benefits`
        );
    }

    updateRatePlanBenefits(
        homestayId: number | string,
        roomId: number | string,
        ratePlanId: number | string,
        benefits: RatePlanBenefitRequest[]
    ) {
        return this.apiService.put<ApiResponse<void>>(
            `/api/v1/host/homestays/${homestayId}/rooms/${roomId}/rate-plans/${ratePlanId}/benefits`,
            { benefits }
        );
    }


}