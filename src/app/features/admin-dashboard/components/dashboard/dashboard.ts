import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity, DashboardResponse, RevenueData } from '../../../../core/models/dashboard-response.model';
import { AdminService } from '../../../../core/services/admin/admin.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private adminService = inject(AdminService);
  private changeRef  = inject(ChangeDetectorRef);
  
  // State quản lý dữ liệu
  public dashboardData: DashboardResponse | null = null;
  public isLoading: boolean = true;
  public Math = Math;
  public errorMessage: string | null = null;
  

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminService.getDashboardSummary().subscribe({
      next: (response) => {
        console.log(response)
       
        this.dashboardData = response.data; 
        console.log(this.dashboardData)
        this.isLoading = false;
        this.changeRef.detectChanges()
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Dashboard Error:', err);
      }
    });
  }

  // Helper getters để template gọi dữ liệu an toàn
  get revenueData(): RevenueData[] {
    return this.dashboardData?.revenueChart || [];
  }

  get recentActivities(): Activity[] {
    return this.dashboardData?.recentActivities || [];
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = { 
      'BOOKING': 'receipt_long', 
      'USER': 'person_add', 
      'FINANCE': 'account_balance', 
      'SYSTEM': 'memory' 
    };
    return icons[type] || 'info';
  }

  getActivityColor(status: string): string {
    const colors: Record<string, string> = {
      'SUCCESS': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'WARNING': 'bg-amber-50 text-amber-600 border-amber-100',
      'INFO': 'bg-blue-50 text-blue-100 border-blue-100'
    };
    return colors[status] || 'bg-stone-50 text-stone-600 border-stone-100';
  }
  // Thêm hàm này vào class Dashboard
getMaxRevenue(): number {
  const values = this.revenueData.map(d => d.value);
  const max = Math.max(...values);
  return max === 0 ? 1 : max; // Tránh chia cho 0
}

getNormalizedHeight(value: number): number {
  const h = (value / this.getMaxRevenue()) * 100;
  console.log('Height for value', value, 'is:', h); // Kiểm tra console của trình duyệt
  return h;
}
}