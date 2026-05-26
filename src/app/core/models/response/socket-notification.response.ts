export interface WalletSocketNotification {
  type: 'WITHDRAW_APPROVED' | 'WITHDRAW_REJECTED' | 'REFUND_PROCESSED' | 'NEW_BOOKING_REVENUE' | 'CANCELLATION_FEE_REVENUE';
  transactionId: number;
  amount: number;
  status: 'COMPLETED' | 'FAILED';
  message: string;
}