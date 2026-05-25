// 1. Định nghĩa chuẩn DTO (Data Transfer Object)
export type PaymentType = 'CREDIT_CARD' | 'E_WALLET' | 'BANK_TRANSFER';

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  provider: string; // Tên tổ chức: Visa, Mastercard, MoMo, VCB...
  maskedInfo: string; // Thông tin đã che (VD: **** **** **** 4242)
  holderName?: string;
  expiryDate?: string;
  isDefault: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  iconUrl: string;
  brandColor: string; // Màu chủ đạo của thương hiệu
}