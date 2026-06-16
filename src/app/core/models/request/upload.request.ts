export interface UploadRequest {
    fileName: string;
    fileSize: number;
    contentType: string;
    isCover: boolean;
    sortOrder: number;
}
export interface BatchUploadRequest {
  targetId: number;
  items: UploadRequest[];
}