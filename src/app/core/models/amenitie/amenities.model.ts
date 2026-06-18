export interface AmenityItem {
  id: number;
  name: string;
  icon: string;
  category: string;
  popular?: boolean;
}

export interface AmenityCategory {
  key: string;
  title: string;
  description: string;
  icon: string;
}

export interface AmenityPreset {
  key: string;
  title: string;
  description: string;
  icon: string;
  amenityIds: number[];
}
export interface AmenityResponse {
  id: number;
  name: string;
  iconName: string;
  groupName: string;
}

export interface UpdateHomestayAmenitiesRequest {
  amenityIds: number[];
}

export interface RoomAmenityHighlightResponse {
  roomId: number;
  amenityId: number;
  name: string;
  icon: string;
  displayValue: string;
}

export interface RoomAmenityHighlightRequest {
  amenityId: number;
  displayValue: string | null;
}

export interface UpdateRoomAmenityHighlightsRequest {
  highlights: RoomAmenityHighlightRequest[];
}