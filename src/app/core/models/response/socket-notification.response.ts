export interface WalletSocketNotification {
  type: 'WITHDRAW_APPROVED' | 'WITHDRAW_REJECTED';
  transactionId: number;
  amount: number;
  status: 'COMPLETED' | 'FAILED';
  message: string;
}