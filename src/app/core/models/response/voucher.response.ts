import { DiscountType, SponsorType } from '../../enum/offer.enum';

export interface VoucherResponse {
    id: number;
    code: string;
    name: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    pointsRequired: number;
    sponsorType: SponsorType;
    validFrom: string;
    validUntil: string;
    totalIssueLimit: number;
    currentIssueCount: number;
    totalUsageLimit: number;
    currentUsageCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    applicableHomestayIds?: number[];
    isApplyAll?: boolean;
}
