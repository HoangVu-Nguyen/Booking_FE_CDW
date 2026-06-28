export interface HostKycDetailResponse {
  profileId: number;
  name: string;
  email: string;
  phone: string;

  citizenId: string;
  issueDate: string; // ISO Date string: '2026-06-28'
  issueBy: string;

  frontImage: string;
  backImage: string;
  selfie: string;

  aiScore: number;
  ocrData: string; // JSON string
  status: string;
}