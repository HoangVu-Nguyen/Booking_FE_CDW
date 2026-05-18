import { HomestayStatus } from "../../enum/homestay-status";

export interface HomestayCardResponse {
  id: number;
  name: string;
  cityName: string;
  basePrice: number;
  status: HomestayStatus | string; // Giữ string để fallback nếu chưa map kịp enum ở FE
  imageUrls: string[];            // Mảng URL ảnh phục vụ tính năng hover đổi ảnh crossfade
  averageRating: number;
  isFavorite: boolean;            // Luôn là true khi lấy từ API /my-collection
}