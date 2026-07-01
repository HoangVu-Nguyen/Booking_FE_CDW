export interface TourCreateRequest {
    name: string;
    description: string;
    durationType: 'HOURS' | 'HALF_DAY' | 'FULL_DAY' | 'DAYS';
    durationValue: number;
    pricePerPerson: number;
    maxParticipants: number;
    imageKeys?: string[];
}
