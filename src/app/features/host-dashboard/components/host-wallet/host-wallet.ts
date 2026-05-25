import { ChangeDetectorRef, Component, OnInit, NgZone, OnDestroy, inject } from '@angular/core'; // <-- Nhớ import thêm NgZone ở đâyimport { DecimalPipe } from '@angular/common';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HostWalletInfo, WalletTransaction } from '../../../../core/models/response/wallet.response';
import { WalletService } from '../../../../core/services/wallet/wallet.service';
import { ApiResponse } from '../../../../core/models/response/api.response';
import { WebsocketService } from '../../../../core/services/realtime/websocket.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../../core/services/toast/toast.service';


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
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  private toastService = inject(ToastService);
  private walletSocketSub!: Subscription;

  constructor(private walletService: WalletService, private cdr: ChangeDetectorRef, private websocketService: WebsocketService, private zone: NgZone) { }

  ngOnInit(): void {
    this.loadWalletData();
    this.loadTransactions();

    this.loadTransactions();

    this.initRealtimeListener();

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
    this.walletService.getTransactionHistory(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.transactions = res.data.content;

        // Lấy thêm thông tin phân trang từ Backend trả về
        this.totalPages = res.data.totalPages || 0;
        this.totalElements = res.data.totalElements || 0;

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Lỗi tải lịch sử:', err)
    });
  }

  submitWithdraw() {
    if (!this.withdrawAmount || this.withdrawAmount < 50000) {
      this.toastService.error('Lỗi', 'Số tiền rút phải lớn hơn hoặc bằng 50,000 VND.');
      return;
    }
    if (this.withdrawAmount > this.walletInfo.availableBalance) {
      this.toastService.error('Lỗi', 'Số tiền rút vượt quá số dư khả dụng của bạn.');
      return;
    }
    if (!this.bankAccountInfo.trim()) {
     this.toastService.error('Lỗi', 'Vui lòng cung cấp thông tin tài khoản ngân hàng để rút tiền.');
      return;
    }

    this.isLoading = true;

    const payload = {
      amount: this.withdrawAmount,
      bankAccountInfo: this.bankAccountInfo
    };

    this.walletService.requestWithdraw(payload).subscribe({
      next: (res) => {
        this.toastService.success('Thành công', 'Yêu cầu rút tiền của bạn đã được gửi đi và đang chờ xử lý bởi Admin.');
        this.withdrawAmount = null;

        // Cập nhật lại UI lập tức
        this.loadWalletData();
        this.loadTransactions();
      },
      error: (err) => {
        console.error(err);
        // Ưu tiên hiển thị message từ App Exception của Backend trả về
       
        this.toastService.error('Lỗi', err.error?.message || 'Có lỗi xảy ra khi tạo lệnh rút tiền.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  private initRealtimeListener() {
    this.walletSocketSub = this.websocketService.listenWalletStatus().subscribe({
      next: (notification) => {
        console.log('🔔 Nhận tín hiệu đổi trạng thái ví từ Admin:', notification);

        // Ép Angular đưa luồng WebSocket ngầm vào lại trong Change Detection Zone
        this.zone.run(() => {

          // Bước 1: Gọi API lấy dữ liệu mới nhất dưới DB lên
          this.walletService.getWalletInfo().subscribe({
            next: (res) => {
              this.walletInfo = res.data;

              // Bước 2: Tải lại lịch sử bảng giao dịch
              this.walletService.getTransactionHistory(this.currentPage, 10).subscribe({
                next: (txRes) => {
                  this.transactions = txRes.data.content;
                  console.log('Cập nhật lịch sử giao dịch sau khi nhận WebSocket:', this.transactions);

                  // Bước 3: Ép render giao diện khi TẤT CẢ dữ liệu mới đã nằm trong bộ nhớ JavaScipt
                  this.cdr.detectChanges();

                  // Bước 4: Hiển thị thông báo sau cùng để không chặn luồng tải dữ liệu
                  setTimeout(() => {
                    alert(notification.message);
                  }, 100);
                }
              });
            }
          });

        });
      },
      error: (err) => console.error('Lỗi luồng Socket tại Component:', err)
    });
  }

  ngOnDestroy(): void {
    // LUÔN LUÔN HỦY SUBSCRIBE KHI THOÁT COMPONENT ĐỂ TRÁNH LỖI TRÀO BỘ NHỚ (MEMORY LEAK)
    if (this.walletSocketSub) {
      this.walletSocketSub.unsubscribe();
    }
  }
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTransactions();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTransactions();
    }
  }

  // Tính toán các con số để hiển thị chữ "Hiển thị 1-10 / 50 giao dịch"
  get startIndex(): number {
    return this.totalElements === 0 ? 0 : (this.currentPage * this.pageSize) + 1;
  }

  get endIndex(): number {
    const end = (this.currentPage + 1) * this.pageSize;
    return end > this.totalElements ? this.totalElements : end;
  }
}