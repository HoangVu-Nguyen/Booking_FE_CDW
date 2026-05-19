export interface GlobalSearchResponse {
  id: number;
  name: string;
  cityName: string;
  basePrice: number;
  imageUrls: string[];
  type: 'HOMESTAY' | 'TOUR';
  rating: number;
  guests: number;
  bedrooms: number;
}