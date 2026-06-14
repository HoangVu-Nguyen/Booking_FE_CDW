import { HomestayStatus } from "../../enum/homestay-status";
import { OwnerResponse } from "./homestay.response";

// =====================================
// ENUMS
// =====================================
export enum RoomCalendarStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
  BLOCKED = 'BLOCKED'
}

// =====================================
// GÓI CƠ BẢN & CHI TIẾT
// =====================================
export interface BookingSimpleInfo {
  bookingCode: string;
  guestName: string;
  quantity: number;
}

export interface CalendarInventoryResponse {
  date: string;
  priceOverride: number | null;
  availableQuantity: number;
  status: RoomCalendarStatus;
  bookingCode?: string;
  guestName?: string;
  totalBookedInDay: number;
  bookings: BookingSimpleInfo[];
}

// 👉 ĐÂY LÀ 2 INTERFACE MỚI THÊM VÀO THEO BACKEND
export interface RoomImageResponse {
  id: number;
  url: string;
  isCover: boolean;
}

export interface BedResponse {
  id: number;
  type: string;
  quantity: number;
}

// =====================================
// INTERFACE CẤP PHÒNG (ĐÃ CẬP NHẬT)
// =====================================
export interface CalendarRoomResponse {
  id: number;
  name: string;
  tag: string;
  basePrice: number;

  // Xóa imageUrl cũ, thay bằng 2 mảng mới
  images: RoomImageResponse[];
  beds: BedResponse[];

  inventory: CalendarInventoryResponse[];
}

// =====================================
// INTERFACE CẤP CAO NHẤT (ROOT)
// =====================================
export interface HomestayCalendarResponse {
  roomCode: string;
  status: HomestayStatus;
  homestayName: string;
  homestayId: string;
  rooms: CalendarRoomResponse[];
  owner: OwnerResponse;
}