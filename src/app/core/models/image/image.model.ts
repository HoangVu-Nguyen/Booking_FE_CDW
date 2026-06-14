export interface LightboxImage {
  url: string;
  isCover?: boolean; // Tùy chọn: Có phải ảnh bìa không
  caption?: string;  // Tùy chọn: Dòng text mô tả ảnh (nếu cần)
}