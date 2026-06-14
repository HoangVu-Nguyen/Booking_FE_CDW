import { BedResponse, CalendarInventoryResponse, RoomCalendarStatus, RoomImageResponse } from "./calendar.response";
import { AmenityResponse } from "./homestay.response";

export interface RoomResponse {
    id: number;
    name: string;
    description: string;
    tag: string;         // 'Master Suite', 'Premium'
    area: string;        // '75 m²'
    floor: string;       // 'Level 03'
    wing: string;        // 'Ocean Wing'
    checkInTime: string; // '14:00 PM'
    maxGuests: number;
    bedCount: number;
    availableQuantity: number;

    highlights: AmenityHighlight[];
    ratePlans: RatePlanResponse[];
    
    images: RoomImageResponse[];
    basePrice: number;
    beds: BedResponse[];
    inventory: CalendarInventoryResponse[];
}

export interface AmenityHighlight {
    icon: string;   // icon name từ Backend (ví dụ: 'wifi')
    label: string;  // tên tiện ích (ví dụ: 'Connectivity')
    value: string;  // thông số tùy chỉnh (ví dụ: '150 Mbps')
}

export interface RatePlanResponse {
    id: number;
    name: string;             // 'Standard Experience', 'Luxury Package'
    price: number;            // Giá theo đêm (Backend trả về BigDecimal -> number)
    isNonRefundable: boolean;
    benefits: string[];       // Danh sách text tích xanh (đã được BE xử lý JOIN)
}
export interface DrawerRatePlanEdit {
  ratePlanId: number;
  name: string;
  price: number; // Giá Host nhập vào cho ngày/giai đoạn này
}

export interface RoomDrawerData {
  roomId: number;
  availableQuantity: number;
  status: RoomCalendarStatus; // AVAILABLE, BLOCKED, MAINTENANCE
  ratePlans: DrawerRatePlanEdit[]; // 👉 Danh sách các gói giá để edit
}
export interface RoomDisplayResponse {
  id: number;
  name: string;
  type?: string;
  description?: string;
  maxGuests?: number;
  area?: number | null;
  hasPrivateBathroom?: boolean;
  beds?: BedResponse[];
  images?: RoomImageResponse[];
}
