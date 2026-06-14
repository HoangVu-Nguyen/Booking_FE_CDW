export interface UploadRequest {
    fileName: string;
    fileSize: number;
    contentType: string;
    isCover: boolean;
    sortOrder: number;
}