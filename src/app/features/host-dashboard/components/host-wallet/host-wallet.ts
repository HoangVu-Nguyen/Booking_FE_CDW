import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HostWalletInfo, WalletTransaction } from '../../../../core/models/response/wallet.response';
import { WalletService } from '../../../../core/services/wallet/wallet.service';
import { ApiResponse } from '../../../../core/models/response/api.response';


@Component({
  selector: 'app-host-wallet',
  standalone: true, // Nhìn cách khai báo imports thì có vẻ bác đang dùng Standalone Component
  imports: [DecimalPipe, CommonModule, FormsModule],
  templateUrl: './host-wallet.html',
  styleUrl: './host-wallet.css',
})
export class HostWallet implements OnInit {
  
  // Khởi tạo giá trị mặc định để UI không bị vỡ lúc chưa load xong
  walletInfo: HostWalletInfo = {
    availableBalance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0
  };

  withdrawAmount: number | null = null;
  bankAccountInfo: string = '';
  transactions: WalletTransaction[] = [];
  
  isLoading: boolean = false;
  currentPage: number = 0;

  constructor(private walletService: WalletService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadWalletData();
    this.loadTransactions();
  }

  loadWalletData() {
    this.walletService.getWalletInfo().subscribe({
      next: (res) => {
        console.log('Thông tin ví:', res.data);
        this.walletInfo = res.data;
        
        // 3. Báo cáo cho Angular biết dữ liệu đã thay đổi hợp lệ
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Lỗi tải ví:', err);
      }
    });
  }

  loadTransactions() {
    this.walletService.getTransactionHistory(this.currentPage, 10).subscribe({
      next: (res) => {
        this.transactions = res.data.content;
        console.log('Lịch sử giao dịch:', this.transactions);
        
        // 4. Báo cáo thay đổi cho bảng lịch sử
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi tải lịch sử:', err)
    });
  }

  submitWithdraw() {
    if (!this.withdrawAmount || this.withdrawAmount < 50000) {
      alert('Số tiền rút tối thiểu là 50,000 VNĐ');
      return;
    }
    if (this.withdrawAmount > this.walletInfo.availableBalance) {
      alert('Số dư khả dụng không đủ!');
      return;
    }
    if (!this.bankAccountInfo.trim()) {
      alert('Vui lòng nhập thông tin ngân hàng!');
      return;
    }

    this.isLoading = true;
    
    const payload = {
      amount: this.withdrawAmount,
      bankAccountInfo: this.bankAccountInfo
    };

    this.walletService.requestWithdraw(payload).subscribe({
      next: (res) => {
        alert('Tạo lệnh rút tiền thành công!');
        this.withdrawAmount = null;
        
        // Cập nhật lại UI lập tức
        this.loadWalletData();
        this.loadTransactions();
      },
      error: (err) => {
        console.error(err);
        // Ưu tiên hiển thị message từ App Exception của Backend trả về
        alert(err.error?.message || 'Có lỗi xảy ra khi tạo lệnh rút tiền.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}