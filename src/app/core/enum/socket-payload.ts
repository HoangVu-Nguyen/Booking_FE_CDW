export interface SocketPayload<T> {
  type: string;        // Ví dụ: "WALLET_UPDATE", "BOOKING_CONFIRMED", "SYSTEM_ALERT"
  data: T;             // Nội dung chi tiết (JSON)
  timestamp: string;
}