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

export interface RatePlanPriceResponse {
  ratePlanId: number;
  name: string;
  price: number | null;
  basePrice: number | null;
  hasOverride?: boolean;
}

export interface CalendarInventoryResponse {
  date: string;

  // Backend mới
  displayPrice: number | null;
  priceOverride: number | null;
  hasPriceOverride: boolean;

  availableQuantity: number;
  status: RoomCalendarStatus;

  bookingCode?: string;
  guestName?: string;

  totalBookedInDay: number;
  bookings: BookingSimpleInfo[];

  ratePlanPrices: RatePlanPriceResponse[];
}

export interface RoomImageResponse {
  id: number;
  url: string;
  isCover: boolean;
   displayOrder?: number;
}

export interface BedResponse {
  id: number;
  type: string;
  quantity: number;
}

export interface CalendarRoomResponse {
  id: number;
  name: string;
  tag?: string;

  // Có thể BE vẫn trả basePrice, nhưng không nên bắt buộc vì giá chính nằm trong ratePlans/displayPrice
  basePrice?: number | null;

  images: RoomImageResponse[];
  beds: BedResponse[];

  inventory: CalendarInventoryResponse[];
  ratePlans: RatePlanPriceResponse[];
}

export interface HomestayCalendarResponse {
  roomCode: string;
  status: HomestayStatus;
  homestayName: string;
  homestayId: string;
  rooms: CalendarRoomResponse[];
  owner: OwnerResponse;
}