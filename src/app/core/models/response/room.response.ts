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
    quantity: number;
    imageUrl: string;
    availableQuantity:number;

    // 6 ô Icon nổi bật (Dữ liệu từ bảng room_amenity_highlights)
    highlights: AmenityHighlight[];

    // Các gói giá (Dữ liệu từ bảng room_rate_plans)
    ratePlans: RatePlanResponse[];
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