export interface RatePlanBenefitRequest {
  amenityId: number;
  displayValue: string | null;
}

export interface UpdateRatePlanBenefitsRequest {
  benefits: RatePlanBenefitRequest[];
}

export interface RatePlanBenefitResponse {
  ratePlanId: number;
  amenityId: number;
  name: string;
  iconName: string;
  groupName: string;
  displayValue: string | null;
}