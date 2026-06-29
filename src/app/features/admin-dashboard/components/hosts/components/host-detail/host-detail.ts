import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // Import đúng ActivatedRoute
import { HostDetailResponse, PropertyDto } from '../../../../../../core/models/response/host-detail.response';
import { AdminService } from '../../../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-admin-host-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './host-detail.html'
})
export class HostDetail implements OnInit {
  private location = inject(Location);
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'OVERVIEW' | 'PROPERTIES' | 'KYC_DOCS' | 'AUDIT_LOG' = 'PROPERTIES';
  hostData: HostDetailResponse | null = null;
  isLoading = true;
  selectedImage: string | null = null;
  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id']; // ID từ URL: /admin/hosts/:id
      if (id) {
        // Nếu ID có tiền tố 'HST-', tách nó ra
        const cleanId = id.replace('HST-', '');
        this.loadHostDetail(cleanId);
      }
    });
  }

  loadHostDetail(id: string) {
    this.isLoading = true;
    this.adminService.getHostDetail(id).subscribe({
      next: (res) => {
        this.hostData = res.data;
        console.log(res)
        this.isLoading = false;
        this.cdr.detectChanges(); // Ép buộc update UI
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu:', err);
        this.isLoading = false;
      }
    });
  }

  // Sửa lại để dùng PropertyDto từ DTO thật
  togglePropertyStatus(prop: PropertyDto) {
    // Logic gọi API update status ở đây
    console.log('Toggle status cho:', prop.id);
  }

  // Cập nhật lại logic config dựa trên string status thật từ Backend
  getPropertyStatusConfig(status: string) {
    const map: any = {
      'ACTIVE': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Hoạt động' },
      'PENDING_DOCS': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Chờ duyệt Sổ' },
      'SUSPENDED': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Đình chỉ' }
    };
    return map[status] || { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'Khác' };
  }

  goBack() { this.location.back(); }
  suspendHost() {
    if (!this.hostData) return;

    if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn đình chỉ host này?')) {
      // Gọi API suspend tại đây nếu bạn đã có service
      this.hostData.host.status = 'SUSPENDED';
      console.log('Đã đình chỉ host:', this.hostData.host.id);
    }
  }
  openImageModal(url: string) {
    if (url) this.selectedImage = url;
  }
}