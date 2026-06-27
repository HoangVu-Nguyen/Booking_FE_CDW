export interface PreUploadResponse {
  // ID của bản ghi tài liệu trong database
  documentId: number;
  
  // Tên gốc của file
  fileName: string;
  
  // Đường dẫn định danh trên S3 (object key)
  objectKey: string;
  
  // URL có chữ ký để FE dùng PUT file lên S3
  uploadUrl: string;
}