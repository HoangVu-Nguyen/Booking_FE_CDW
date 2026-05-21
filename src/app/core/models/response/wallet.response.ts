// wallet.models.ts

export interface HostWalletInfo {
  id?: number;
  ownerId?: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  updatedAt?: string;
}

export interface WithdrawRequest {
  amount: number;
  bankAccountInfo: string;
}

export type TransactionType = 'BOOKING_REVENUE' | 'ESCROW_RELEASE' | 'WITHDRAWAL' | 'REFUND_DEDUCTION';
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface WalletTransaction {
  id: number;
  walletId: number;
  bookingId?: number;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  bankAccountInfo?: string;
  description: string;
  createdAt: string;
}

