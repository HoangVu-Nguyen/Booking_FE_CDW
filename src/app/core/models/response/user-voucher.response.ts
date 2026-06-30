import { DiscountType } from '../../enum/offer.enum';

export interface UserVoucherResponse {
    id: number;
    code: string;
    title: string;
    discountValue: number;
    discountType: DiscountType;
    validUntil: string;
    status: string; // 'ACTIVE', 'USED', 'EXPIRED'
}
