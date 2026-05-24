import { HomestayStatus } from "../../enum/homestay-status";
import { OwnerResponse } from "./homestay.response";

export enum RoomCalendarStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
  BLOCKED = 'BLOCKED'
}

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
  totalBookedInDay: number; // Mới
  bookings: BookingSimpleInfo[]; // Danh sách các đơn trong ngày
}

export interface CalendarRoomResponse {
  id: number;
  name: string;
  imageUrl: string;
  tag: string;
  basePrice: number;
  inventory: CalendarInventoryResponse[];
}
export interface HomestayCalendarResponse {
  roomCode: string;
  status: HomestayStatus;
  homestayName: string;
  homestayId: string;
  rooms: CalendarRoomResponse[];
  owner:OwnerResponse;
}