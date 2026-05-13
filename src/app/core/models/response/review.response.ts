export interface ReviewResponse {
  id: number;                // Từ reviews.id
  rating: number;            // Từ reviews.rating (1-5 sao)
  comment: string;           // Từ reviews.comment
  createdAt: string | Date;  // Từ reviews.created_at (Backend trả về ISO string)
  
  // Thông tin người đánh giá
  userId: number;            // Từ reviews.user_id
  fullName: string;          // Mapping từ users.full_name
  avatarUrl?: string;        // Mapping từ user_photos.photo_url (mã chk_photo_type đã fix)
  
  // Danh sách ảnh do khách chụp trong Review
  // Lấy từ bảng review_images
  imageUrls: string[];
}