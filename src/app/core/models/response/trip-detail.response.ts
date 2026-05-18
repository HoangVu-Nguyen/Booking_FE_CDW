export interface PropertyDetailInfo {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    images: string[];
}

export interface HostInfo {
   id:string;
    fullName:string;
    avatar:string;
    email:string;
    phoneNumber:string;
    joinedAt:Date;
}

export interface RoomBookedInfo {
    roomName: string;
    roomTag: string;
    quantity: number;
    guests: number;
}

export interface TourTimelineInfo {
    tourId: string;
    tourName: string;
    tourImage: string;
    tourDate: string;   // "yyyy-MM-dd"
    startTime: string;  
    endTime: string;    // "HH:mm"
    participants: number;
}

export interface TripDetailResponse {
    bookingCode: string;
    status: 'PENDING' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
    paymentStatus: string;
    checkIn: string;
    checkOut: string;
    totalGuests: number;
    totalPrice: number;
    paymentMethod: string;
    property: PropertyDetailInfo;
    host: HostInfo;
    rooms: RoomBookedInfo[];
    tours: TourTimelineInfo[];
    policy: BookingPolicyInfo;
}
export interface BookingPolicyInfo {
    checkInTime: string;
    checkOutTime: string;
    allowsPets: boolean;
    allowsSmoking: boolean;
    allowsParties: boolean;
}