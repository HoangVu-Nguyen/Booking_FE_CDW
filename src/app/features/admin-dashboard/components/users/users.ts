import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { AdminUserResponse } from '../../../../core/models/response/admin.reponse';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
})
export class AdminUsers implements OnInit {
  private toastService = inject(ToastService);
  private adminService = inject(AdminService);
  private changeRef = inject(ChangeDetectorRef);

  users: AdminUserResponse[] = [];

  // Filters
  searchTerm: string = '';
  roleFilter: string = 'ALL';
  statusFilter: string = 'ALL';

  // Pagination
  currentPage: number = 0;
  totalPages: number = 1;
  pageSize: number = 10;

  // Stats
  totalUsers: number = 0;
  activeHosts: number = 0;
  lockedUsers: number = 0;
  isLoading: boolean = false;

  // Map to track loading state for toggle button per user
  processingMap: Record<number, boolean> = {};

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.adminService.getAdminUsers(this.searchTerm, this.roleFilter, this.statusFilter, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        const data = res.data;
        this.users = data.content;
        this.totalPages = data.totalPages;
        this.totalUsers = data.stats.totalUsers;
        this.activeHosts = data.stats.activeHosts;
        this.lockedUsers = data.stats.lockedUsers;
        this.isLoading = false;
        this.changeRef.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.toastService.error('Lỗi', 'Không thể tải danh sách người dùng');
        this.changeRef.detectChanges();
      }
    });
  }

  applyFilters() {
    this.currentPage = 0;
    this.loadData();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadData();
    }
  }

  toggleUserStatus(user: AdminUserResponse) {
    if (this.processingMap[user.id]) return;

    this.processingMap[user.id] = true;
    const isCurrentlyActive = user.status === 'ACTIVE';
    const actionName = isCurrentlyActive ? 'Khóa' : 'Mở khóa';

    this.adminService.toggleUserStatus(user.id).subscribe({
      next: () => {
        this.processingMap[user.id] = false;
        this.toastService.success('Thành công', `Đã ${actionName.toLowerCase()} tài khoản của ${user.fullName}`);
        this.loadData(); // reload stats
        this.changeRef.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.processingMap[user.id] = false;
        this.toastService.error('Lỗi', `Không thể ${actionName.toLowerCase()} tài khoản`);
        this.changeRef.detectChanges();
      }
    });
  }
}
