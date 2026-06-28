export interface HostPendingResponse {
    profileId: number;
    name: string;
    aiConfidence: number;
    submittedAt: string; // ISO String từ Backend
    status: string;
}