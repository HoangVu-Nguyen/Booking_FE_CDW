// portfolio.model.ts

export interface PortfolioTimelineResponse {
  homes: HomeTimelineDto[];
}

export interface HomeTimelineDto {
  homeId: number;
  homeName: string;
  address: string;
  primaryImageUrl: string | null;
  rooms: RoomTimelineResponse[];
}

export interface RoomTimelineResponse {
  roomId: number;
  roomName: string;
  dailyStatuses: DailyStatusResponse[];
  bookings: BookingBlockResponse[];
  imageUrl:string;
}

export interface DailyStatusResponse {
  date: string; // LocalDate từ Java thường serialize ra string yyyy-MM-dd
  price: number;
  availableQuantity: number;
}

export interface BookingBlockResponse {
  bookingId: number;
  guestName: string;
  avatarUrl: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
}