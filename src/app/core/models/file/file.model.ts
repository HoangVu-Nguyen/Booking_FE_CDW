import { ImageType } from "../../enum/image-type.enum";

export interface ChatSendPayload {
  content: string;
  files?: File[]; 
}
// Định nghĩa cấu trúc file nháp gửi lên BE
export interface UploadItemRequest {
  fileName: string;
  contentType: string;
  imageType:ImageType
  fileSize: number;
}

export interface BatchUploadRequest {
  items: UploadItemRequest[];
}

// Cấu trúc BE trả về
export interface PresignedUrlResponse {
  uploadUrl: string; // Dùng để PUT file lên S3
  objectKey: string; // Dùng để lưu vào Message làm fileUrl
}