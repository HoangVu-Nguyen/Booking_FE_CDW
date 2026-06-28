import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../../../core/services/admin/admin.service'; 
import { ConfirmationService } from '../../../../../../core/services/confirm/confirm.service';

@Component({
  selector: 'app-kyc-detail-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kyc-detail-drawer.html',
  styleUrl: './kyc-detail-drawer.css'
})
export class KycDetailDrawer {
  private adminService = inject(AdminService);
  private confirmService = inject(ConfirmationService);

  @Input() open = false;
  @Input() host: any;
  @Output() close = new EventEmitter<void>();
  @Output() actionCompleted = new EventEmitter<void>();

  isProcessing = false;

  closeDrawer() {
    // Chống đóng Drawer khi đang call API
    if (this.isProcessing) return; 
    this.close.emit();
  }

  onApprove() {
    this.confirmService.confirm(
      'Duyệt hồ sơ',
      `Bạn có chắc chắn muốn phê duyệt hồ sơ của ${this.host?.name} không?`,
      () => {
        this.isProcessing = true;
        this.adminService.approveKyc(this.host.profileId).subscribe({
          next: () => {
            // Nên thay alert bằng Toast Service nếu có
            alert('Duyệt thành công!'); 
            this.isProcessing = false;
            this.closeDrawer();
            this.confirmService.close();
            this.actionCompleted.emit();
          },
          error: () => {
            alert('Lỗi hệ thống!');
            this.isProcessing = false;
          }
        });
      }
    );
  }

  onReject() {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason) return;

    this.confirmService.confirm(
      'Từ chối hồ sơ',
      `Bạn có chắc chắn muốn từ chối với lý do: "${reason}"?`,
      () => {
        this.isProcessing = true;
        this.adminService.rejectKyc(this.host.profileId, reason).subscribe({
          next: () => {
            alert('Đã từ chối!');
            this.isProcessing = false;
            this.closeDrawer();
            this.confirmService.close();
            this.actionCompleted.emit();
          },
          error: () => {
            alert('Lỗi hệ thống!');
            this.isProcessing = false;
          }
        });
      }
    );
  }
}