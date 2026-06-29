import { UserHeaderResponse } from './user-header.response';

export interface HostDetailResponse {
  host: HostInfo;
  properties: PropertyDto[];
  auditLogs: AuditLogDto[];
}

export interface HostInfo {
  id: string;
  joinDate: string;
  status: 'ACTIVE' | 'PENDING_KYC' | 'SUSPENDED' | 'REJECTED';
  walletBalance: number;
  totalRevenue: number;
  user: UserHeaderResponse;
  metrics: MetricsDto;
  kyc: KycDto;
}

export interface MetricsDto {
  totalBookings: number;
  cancellationRate: number;
  responseRate: number;
  avgRating: number;
  reviewsCount: number;
}

export interface KycDto {
  identity: string;
  idNumber: string;
  bankInfo: BankInfoDto;
  frontImageUrl:string;
  backImageUrl:string;
  

}

export interface BankInfoDto {
  bankName: string;
  accountNo: string;
  ownerName: string;
}

export interface PropertyDto {
  id: string;
  name: string;
  type: string;
  location: string;
  image: string;
  status: 'ACTIVE' | 'PENDING_DOCS' | 'SUSPENDED';
  metrics: PropertyMetricsDto;
}

export interface PropertyMetricsDto {
  bookings: number;
  revenue: number;
  rating: number;
}

export interface AuditLogDto {
  time: string;
  action: string;
  desc: string;
  status: 'SUCCESS' | 'INFO' | 'WARNING';
}