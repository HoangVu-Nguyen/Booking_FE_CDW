import { Component, EventEmitter, OnInit, Output, inject,ChangeDetectorRef } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { AdminService } from '../../../../../../core/services/admin/admin.service';
import { HostPendingResponse } from '../../../../../../core/models/host/host-pending.response';


@Component({
  selector: 'app-kyc-list',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './kyc-list.html',
  styleUrl: './kyc-list.css',
})
export class KycList implements OnInit {
  // Inject service
  private adminService = inject(AdminService);
  private changeRef = inject(ChangeDetectorRef);

  pendingHosts: HostPendingResponse[] = [];
  isLoading: boolean = true; 
  selectedHost: any = null; 
  isDrawerOpen: boolean = false;

  @Output() viewHost = new EventEmitter<HostPendingResponse>();

  ngOnInit(): void {
    this.fetchPendingKyc();
  }

  fetchPendingKyc(): void {
    this.isLoading = true;
    this.adminService.getPendingKycProfiles().subscribe({
      next: (res) => {
        console.log(res.data)
        if (res.data) {
          
          this.pendingHosts = res.data;
          this.changeRef.detectChanges();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách KYC:', err);
        this.isLoading = false;
      }
    });
  }

  openKycModal(host: HostPendingResponse): void {
    this.viewHost.emit(host);
  }

  // Hàm tạo màu background ngẫu nhiên nhưng cố định theo tên (Chuẩn UI xịn)
  getAvatarColor(name: string): string {
    if (!name) return 'bg-stone-500'; // Đề phòng trường hợp name null/undefined từ API
    
    const colors = [
      'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 
      'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }



}