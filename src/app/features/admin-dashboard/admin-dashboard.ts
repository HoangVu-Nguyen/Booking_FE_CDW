import { Component, inject,ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin/admin.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private adminService = inject(AdminService);
  private changeRef = inject(ChangeDetectorRef);

  // Biến lưu số lượng chờ duyệt
  pendingCount: number = 0;

  ngOnInit() {
    this.fetchPendingCount();
  }

  fetchPendingCount() {
    this.adminService.countPendingKyc().subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingCount = res.data;
          this.changeRef.detectChanges()

        }
      },
      error: (err) => console.error('Lỗi lấy số lượng chờ duyệt:', err)
    });
  }
}

