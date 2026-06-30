export interface RevenueData {
  label: string;
  value: number;
  day: string;
  today: boolean;
}

export interface Activity {
  id: string;
  title: string;
  time: string;
  type: 'BOOKING' | 'USER' | 'FINANCE' | 'SYSTEM';
  status: 'SUCCESS' | 'WARNING' | 'INFO';
}

export interface DashboardResponse {
  gmvToday: number;
  gmvGrowthPercentage: number;
  newBookings: number;
  pendingBookings: number;
  newHosts: number;
  pendingKycCount: number;
  occupancyRate: number;
  revenueChart: RevenueData[];
  recentActivities: Activity[];
}