export interface LedgerKpiResponse {
  totalGmv: number;
  netRevenue: number;
  hostDebt: number;
  totalRefunds: number;
}

// DTO cho Từng dòng giao dịch trong Bảng
export interface LedgerTransaction {
  id: string;
  date: string; // ISO date string
  type: 'PAYMENT_IN' | 'PAYOUT_OUT' | 'REFUND';
  status: string;
  guest?: {
    name: string;
    avatar: string;
  };
  host: {
    name: string;
  };
  paymentDetails: {
    method: string;
    bank?: string;
    last4?: string;
  };
  amounts: {
    gross: number;
    platformFee: number;
    netToHost: number;
  };
}