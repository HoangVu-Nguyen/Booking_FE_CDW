import { HomestayStatus } from "../../enum/homestay-status";
import { ReviewResponse } from "./review.response";
import { RoomResponse } from "./room.response";
import { TourResponse } from "./tour.response";

export interface HomestayResponse {
  id: number;
  name: string;
  description: string;
  addressDetail: string;
  basePrice: number;
  
  maxGuests: number;
  numBedrooms: number;
  numBathrooms: number;
  
  latitude: number;
  longitude: number;
  categoryName: string;
  cityName: string;
  
  imageUrls: string[];
  amenities: AmenityResponse[];
  owner: OwnerResponse;
  status:HomestayStatus;
  
  averageRating: number;
  reviewCount: number;
  tours:TourResponse[];
  rooms:RoomResponse[];
  favorite: boolean;
}

export interface AmenityResponse {
  id: number;
  name: string;
  iconName: string; 
  groupName: string;
}

export interface OwnerResponse {
  id: number;
  fullName: string;
  avatar: string;
  isVerified: boolean;
}
export interface BookingAvailabilityResponse {
  rooms: RoomResponse[];
  suggestedTours: TourResponse[];
}