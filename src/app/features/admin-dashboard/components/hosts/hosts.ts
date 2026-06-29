import { Component, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { AdminHostResponse } from '../../../../core/models/response/admin.reponse';
import { PageResponse } from '../../../../core/models/response/page.response';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';


@Component({
  selector: 'app-admin-hosts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hosts.html'
})
export class Hosts implements OnInit {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private changeRef = inject(ChangeDetectorRef);

  // Trạng thái component
  hosts: AdminHostResponse[] = [];
  isLoading = true;
  error: string | null = null;
  currentKeyword: string = '';

  // Pagination meta
  totalElements = 0;
  currentPage = 0;
  pageResponse: PageResponse<any> | null = null;

  ngOnInit() {
    this.loadHosts();
  }

 loadHosts(keyword: string = '', page: number = 0) {
  console.log(page)
  this.isLoading = true;
  this.adminService.getHosts(keyword, page).subscribe({
    next: (res) => {
      console.log(res)
      // 1. Cập nhật data
      this.hosts = res.data.content;
      console.log(this.hosts)
      
      // 2. Cập nhật state phân trang quan trọng
      this.pageResponse = res.data; // Lưu toàn bộ object chứa totalPages, last, first...
      this.currentPage = res.data.number; // number là index trang hiện tại của Spring Pageable
      
      this.isLoading = false;
      this.changeRef.detectChanges();
    },
    error: (err) => {
      this.error = 'Không thể tải dữ liệu đối tác.';
      this.isLoading = false;
      console.error(err);
    }
  });
}


  getStatusConfig(status: string) {
    const configs: any = {
      'ACTIVE': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', label: 'Hoạt động', dot: 'bg-emerald-500' },
      'PENDING_KYC': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60', label: 'Chờ duyệt KYC', dot: 'bg-amber-500 animate-pulse' },
      'SUSPENDED': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60', label: 'Bị khóa', dot: 'bg-rose-500' }
    };
    return configs[status] || { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Khác', dot: 'bg-gray-500' };
  }

  viewHostDetail(hostId: string) {
    this.router.navigate(['/admin/hosts', hostId]);
  }

  private searchSubject = new Subject<string>();

constructor() {
  this.searchSubject.pipe(
    debounceTime(300), 
    distinctUntilChanged()
  ).subscribe(keyword => this.loadHosts(keyword, 0));
}

onSearch(event: any) {
  this.currentKeyword = event.target.value;
  this.searchSubject.next(this.currentKeyword);
}

onPageChange(page: number) {
  if (page < 0 || (this.pageResponse && page >= this.pageResponse.totalPages)) {
    return; 
  }
  console.log(page)
  this.loadHosts(this.currentKeyword, page);
}
}