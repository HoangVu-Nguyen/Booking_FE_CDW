export interface UserPaymentMethod {
  id: number;
  userId: number;
  provider: string;       // STRIPE, PAYPAL
  cardBrand: string;      // VISA, MASTERCARD, AMEX
  cardType: string;       // CREDIT, DEBIT
  lastFour: string;       // 8842
  expMonth: number;
  expYear: number;
  cardHolderName: string;
  isPrimary: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'LOCKED';
}
export interface HostBankAccount {
  id: number;
  amount?:number;
  bankName: string;         // 'Vietcombank', 'Techcombank'
  bankCode: string;         // 'VCB', 'TCB' để làm logo
  accountNumber: string;    // '190354678910' -> HIỂN THỊ RÕ ĐỂ ADMIN XEM
  accountHolderName: string;// 'NGUYEN VAN A'
  isDefault: boolean;

}