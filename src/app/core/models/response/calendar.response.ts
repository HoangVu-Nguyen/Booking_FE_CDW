export enum RoomCalendarStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
  BLOCKED = 'BLOCKED'
}

export interface CalendarInventoryResponse {
  date: string; // ISO Date (YYYY-MM-DD)
  priceOverride: number | null;
  availableQuantity: number;
  status: RoomCalendarStatus;
  bookingCode?: string;
  guestName?: string;
}

export interface CalendarRoomResponse {
  id: number;
  name: string;
  tag: string;
  basePrice: number;
  inventory: CalendarInventoryResponse[];
}