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