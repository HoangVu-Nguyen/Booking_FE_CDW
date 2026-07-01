export interface UploadRequest {
    fileName: string;
    fileSize: number;
    contentType: string;
    isCover: boolean;
    sortOrder: number;
    imageType: string;
}
export interface BatchUploadRequest {
  targetId: number;
  items: UploadRequest[];
}