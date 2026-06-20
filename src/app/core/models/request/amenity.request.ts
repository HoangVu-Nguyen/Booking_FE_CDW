export interface RatePlanBenefitRequest {
  amenityId: number;
  displayValue: string | null;
}

export interface UpdateRatePlanBenefitsRequest {
  benefits: RatePlanBenefitRequest[];
}

export interface RatePlanBenefitResponse {
  ratePlanId: string | null;
  amenityId: string | null;
  name: string;
  iconName: string;
  groupName: string;
  displayValue: string | null;
}