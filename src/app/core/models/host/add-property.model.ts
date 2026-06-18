import { RatePlanResponse } from "../response/room.response";

export interface RatePlan { name: string; price: number; }
export interface Room {
  name: string;
  type: 'VIP' | 'STANDARD'; // Phân loại phòng
  maxGuests: number;
  quantity: number;
  ratePlans: RatePlanResponse[];
}
export interface PropertyPayload {
  name: string; type: string; address: string; description: string;
  rooms: Room[];
}