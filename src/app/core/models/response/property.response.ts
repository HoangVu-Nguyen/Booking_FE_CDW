// Định nghĩa các trạng thái có thể có của Homestay để code an toàn hơn (Tránh gõ sai chính tả)
export type PropertyStatus = 'AVAILABLE' | 'DRAFT' | 'MAINTENANCE' | 'CLOSED';

// Interface cho phần thống kê (Nested object)
export interface PropertyStats {
  rating: number;
  reviews: number;
  occupancy: number;
}

// Interface chính tương ứng với PropertySummaryResponse bên Java
export interface PropertySummaryResponse {
  id: number;
  name: string;
  type: string;
  location: string;
  image: string | null; // Có thể null nếu chưa có ảnh
  price: number;
  status: PropertyStatus | string; // Ưu tiên dùng union type ở trên
  stats: PropertyStats;
}
export interface HostPortfolioSummaryResponse {
  totalPortfolioValue: number;
  portfolioGrowthRate: number;
  averageOccupancyRate: number;
  occupancyTrend: string;
  averageRating: number;
  ratingGrowth: number;
  totalProperties: number;
}