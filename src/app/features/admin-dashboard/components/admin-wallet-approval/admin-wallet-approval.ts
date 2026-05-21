import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Lưu ý: Bác trỏ lại đường dẫn import sao cho khớp với thư mục project của bác nhé
import { WalletService } from '../../../../core/services/wallet/wallet.service';
import { WalletTransaction } from '../../../../core/models/response/wallet.response';

@Component({
  selector: 'app-admin-wallet-approval',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './admin-wallet-approval.html'
})
export class AdminWalletApproval implements OnInit {
  
  pendingRequests: WalletTransaction[] = [];
  isLoading: boolean = false;
  currentPage: number = 0;
  
  // Biến lưu tổng số tiền cần thanh toán
  totalPendingAmount: number = 0;

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  /**
   * Gọi API lấy danh sách các lệnh đang chờ xử lý (PENDING)
   */
  loadPendingRequests() {
    this.isLoading = true;
    
    // Lấy 50 lệnh chờ cùng lúc để kế toán dễ làm việc
    this.walletService.getPendingWithdrawals(this.currentPage, 50).subscribe({
      next: (res) => {
        // Map dữ liệu từ PageResponse
        this.pendingRequests = res.data.content;
        
        // Tính toán tổng tiền
        this.calculateTotalPendingAmount();
        
        // Báo cho Angular biết dữ liệu đã thay đổi (Tránh lỗi NG0100)
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách chờ duyệt:', err);
        alert('Không thể tải danh sách yêu cầu rút tiền. Vui lòng thử lại sau.');
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Hàm phụ trợ tính tổng tiền của tất cả các lệnh đang hiển thị
   */
  private calculateTotalPendingAmount() {
    this.totalPendingAmount = this.pendingRequests.reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * Xử lý Duyệt lệnh rút tiền (Kế toán đã chuyển khoản thành công)
   */
  approve(tx: WalletTransaction) {
    const isConfirm = window.confirm(`XÁC NHẬN CHUYỂN KHOẢN\n\nBạn xác nhận đã chuyển thành công số tiền ${tx.amount.toLocaleString('vi-VN')} VNĐ\nĐến STK: ${tx.bankAccountInfo}?`);
    
    if (isConfirm) {
      this.isLoading = true;
      this.walletService.resolveWithdrawal(tx.id, 'COMPLETED', 'Kế toán đã chuyển khoản thành công').subscribe({
        next: (res) => {
          // Xóa lệnh vừa duyệt khỏi mảng hiện tại để UI phản hồi ngay lập tức
          this.pendingRequests = this.pendingRequests.filter(item => item.id !== tx.id);
          this.calculateTotalPendingAmount();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Có lỗi xảy ra khi duyệt lệnh.');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Xử lý Từ chối lệnh rút tiền (Sai số TK, ngân hàng bảo trì...)
   */
  reject(tx: WalletTransaction) {
    // Mở hộp thoại yêu cầu nhập lý do
    const reason = window.prompt(`TỪ CHỐI LỆNH RÚT TIỀN (Host ID: ${tx.walletId})\n\nVui lòng nhập lý do từ chối để hệ thống hoàn tiền lại cho Chủ nhà:`);
    
    // Kiểm tra nếu người dùng bấm Cancel hoặc để trống
    if (reason === null) {
      return; // Hủy thao tác
    }
    
    if (reason.trim() === '') {
      alert('Bắt buộc phải nhập lý do từ chối!');
      return;
    }

    this.isLoading = true;
    this.walletService.resolveWithdrawal(tx.id, 'FAILED', reason.trim()).subscribe({
      next: (res) => {
        // Xóa lệnh bị từ chối khỏi mảng
        this.pendingRequests = this.pendingRequests.filter(item => item.id !== tx.id);
        this.calculateTotalPendingAmount();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Có lỗi xảy ra khi từ chối lệnh.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}