export interface PresignedUrlResponse {
    roomId?: number;
    fileName: string;
    objectKey: string;
    uploadUrl: string;
}
