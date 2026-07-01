import { DiscountType, SponsorType } from '../../enum/offer.enum';

export interface VoucherCreateRequest {
    code?: string;
    name: string;
    description?: string;
    discount_type: DiscountType;
    discount_value: number;
    max_discount?: number;
    min_order_value?: number;
    points_required?: number;
    sponsor_type?: SponsorType;
    valid_from?: string;
    valid_until?: string;
    total_issue_limit?: number;
    total_usage_limit?: number;
    applicableHomestayIds?: number[];
    isApplyAll?: boolean;
}
