// invoice.model.ts
export interface InvoiceRecord {
  bookingCode: string;
  title: string;          // Tên property (Homestay/Tour)
  subtitle: string;       // Chi tiết (Check-in, ngày tour...)
  date: string | Date;    // Ngày giao dịch
  paymentMethod: string;  // Tên phương thức (Visa, Apple Pay...)
  amount: number;         // Tổng tiền (totalPrice)
  status: 'PAID' | 'PENDING' | 'REFUNDED'; // Ánh xạ từ BookingStatus & PaymentStatus
  type: 'HOMESTAY' | 'TOUR' | 'MEMBERSHIP'; 
}

export interface FinancialSummary {
  totalSpent: number;
  spendingLimit: number;
  pendingInvoiceCount: number;
  upcomingPayment: InvoiceRecord | null;
}