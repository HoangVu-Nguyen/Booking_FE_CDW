import { UserHeaderResponse } from "./user-header.response";

export interface AdminHostResponse {
  id: string;          
  joinDate: string;     
  status: string;         
  user: UserHeaderResponse;
  verification: VerificationInfo;
  metrics: HostMetrics;
}

// VerificationInfo.ts
export interface VerificationInfo {
  identityStatus: 'APPROVED' | 'PENDING' | 'MISSING' | 'REJECTED';
  bankStatus: 'LINKED' | 'MISSING';
  rejectionReason?: string;
}

// HostMetrics.ts
export interface HostMetrics {
  totalProperties: number;
  pendingProperties: number;
  totalBookings: number;
  totalRevenue: number;
  walletBalance: number;
  cancellationRate: number;
  averageResponseTime: string;
}

export interface AdminUserStatsResponse {
  totalUsers: number;
  activeHosts: number;
  lockedUsers: number;
}

export interface AdminUserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinedDate: string;
  avatar: string;
}

export interface AdminUserListResponse {
  content: AdminUserResponse[];
  stats: AdminUserStatsResponse;
  totalPages: number;
  totalElements: number;
}