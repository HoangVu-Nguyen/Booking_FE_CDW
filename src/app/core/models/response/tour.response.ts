export interface TourResponse {
  id: number;
  homestayId: number;
  name: string;
  description: string;
  durationType: 'HOURS' | 'HALF_DAY' | 'FULL_DAY' | 'DAYS';
  durationValue: number;
  pricePerPerson: number;
  maxParticipants: number;
  status: string;
  primaryImageUrl: string | null;
  hoverImageUrl: string | null;
}