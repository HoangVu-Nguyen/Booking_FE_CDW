import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // Import đúng ActivatedRoute
import { HostDetailResponse, PropertyDto } from '../../../../../../core/models/response/host-detail.response';
import { AdminService } from '../../../../../../core/services/admin/admin.service';
import { ConfirmationService } from '../../../../../../core/services/confirm/confirm.service';

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
  private confirmationService = inject(ConfirmationService);

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
  togglePropertyStatus(prop: PropertyDto) {
    const isBlocking = prop.status === 'APPROVED';
    const actionName = isBlocking ? 'Đình chỉ' : 'Kích hoạt lại';

    this.confirmationService.confirm(
      `${actionName} căn hộ`,
      `Bạn có chắc chắn muốn ${actionName} "${prop.name}"? Vui lòng nhập lý do bên dưới:`,
      (reason: string) => {
        // Logic callback khi nhấn xác nhận
        const newStatus = isBlocking ? 'SUSPENDED' : 'APPROVED';

        this.adminService.updatePropertyStatus(prop.id, newStatus, reason).subscribe({
          next: () => {
            prop.status = newStatus;
            this.confirmationService.close(); // Đóng modal sau khi xong
          },
          error: (err) => {
            console.error(err);
            alert('Có lỗi xảy ra khi cập nhật!');
          }
        });
      },
      true // Hiện ô nhập lý do
    );
  }
}