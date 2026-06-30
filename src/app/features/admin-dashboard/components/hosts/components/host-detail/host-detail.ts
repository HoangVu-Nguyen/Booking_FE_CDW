import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms'; // BẮT BUỘC IMPORT ĐỂ DÙNG ngModel
import { ActivatedRoute } from '@angular/router'; 
import { HostDetailResponse, PropertyDto } from '../../../../../../core/models/response/host-detail.response';
import { AdminService } from '../../../../../../core/services/admin/admin.service';
import { ConfirmationService } from '../../../../../../core/services/confirm/confirm.service';

@Component({
  selector: 'app-admin-host-detail',
  standalone: true,
  imports: [CommonModule, FormsModule], // Thêm FormsModule vào đây
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

  // ==============================================
  // STATE QUẢN LÝ MODAL ĐÌNH CHỈ
  // ==============================================
  showSuspendModal: boolean = false;
  suspendReason: string = '';
  suspendDays: number = 7;
  isSuspending: boolean = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id']; 
      if (id) {
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
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu:', err);
        this.isLoading = false;
      }
    });
  }

  getPropertyStatusConfig(status: string) {
    const map: any = {
      'ACTIVE': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Hoạt động' },
      'PENDING_DOCS': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Chờ duyệt Sổ' },
      'SUSPENDED': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Đình chỉ' }
    };
    return map[status] || { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'Khác' };
  }

  goBack() { this.location.back(); }

  openImageModal(url: string) {
    if (url) this.selectedImage = url;
  }

  // ==============================================
  // LOGIC ĐÌNH CHỈ HOST
  // ==============================================
  openSuspendModal() {
    if (!this.hostData) return;
    this.suspendReason = '';
    this.suspendDays = 7; // Reset mặc định 7 ngày
    this.showSuspendModal = true;
  }

  closeSuspendModal() {
    this.showSuspendModal = false;
  }

  suspendHost() {
    if (!this.hostData || !this.hostData.host) return;
    
    const hostId = this.hostData.host.id;

    // Gọi Confirmation Service của ông
    this.confirmationService.confirm(
        'Đình chỉ hoạt động',
        'Bạn có chắc chắn muốn đình chỉ Host này? Vui lòng nhập lý do cụ thể:',
        (reason: string) => {
            
            // Validate nếu user không nhập lý do
            if (!reason || !reason.trim()) {
                alert('Vui lòng nhập lý do đình chỉ!');
                return; 
            }

            const suspendDays = 7; 

            // Gọi API
            this.adminService.suspendHost(hostId, reason, suspendDays).subscribe({
                next: () => {
                    alert(`Đã đình chỉ Host thành công trong ${suspendDays} ngày!`);
                    
                    // Cập nhật lại UI ngay lập tức
                    this.hostData!.host.status = 'SUSPENDED'; 
                    this.confirmationService.close(); // Đóng Modal của Service
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Lỗi khi khóa Host:', err);
                    alert('Có lỗi xảy ra, không thể đình chỉ.');
                    this.confirmationService.close();
                }
            });
        },
        true // Cho phép hiển thị Textarea nhập lý do
    );
}

  // ==============================================
  // LOGIC KHÓA/MỞ KHÓA TỪNG CĂN HỘ
  // ==============================================
  togglePropertyStatus(prop: PropertyDto) {
    const isBlocking = prop.status === 'APPROVED';
    const actionName = isBlocking ? 'Đình chỉ' : 'Kích hoạt lại';

    this.confirmationService.confirm(
      `${actionName} căn hộ`,
      `Bạn có chắc chắn muốn ${actionName} "${prop.name}"? Vui lòng nhập lý do bên dưới:`,
      (reason: string) => {
        const newStatus = isBlocking ? 'SUSPENDED' : 'APPROVED';

        this.adminService.updatePropertyStatus(prop.id, newStatus, reason).subscribe({
          next: () => {
            prop.status = newStatus;
            this.confirmationService.close(); 
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            alert('Có lỗi xảy ra khi cập nhật!');
          }
        });
      },
      true
    );
  }
}