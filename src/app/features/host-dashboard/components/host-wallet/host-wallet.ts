import { ChangeDetectorRef, Component, OnInit, NgZone, OnDestroy, inject } from '@angular/core'; // <-- Nhớ import thêm NgZone ở đâyimport { DecimalPipe } from '@angular/common';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HostWalletInfo, WalletTransaction, WithdrawRequest } from '../../../../core/models/response/wallet.response';
import { WalletService } from '../../../../core/services/wallet/wallet.service';
import { ApiResponse } from '../../../../core/models/response/api.response';
import { WebsocketService } from '../../../../core/services/realtime/websocket.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { PaymentService } from '../../../../core/services/payment/payment.service';
import { HostBankAccount, UserPaymentMethod } from '../../../../core/models/payment/user-payment-method.model';
import { RevenueChartComponent } from '../revenue-chart/revenue-chart';

@Component({
  selector: 'app-host-wallet',
  standalone: true, // Nhìn cách khai báo imports thì có vẻ bác đang dùng Standalone Component
  imports: [DecimalPipe, CommonModule, FormsModule, RevenueChartComponent],
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
  private paymentService = inject(PaymentService);
  // Bên trong class HostWallet
  savedBanks: HostBankAccount[] = []; // Đổi từ savedCards sang savedBanks
  selectedBank: HostBankAccount | null = null;

  constructor(private walletService: WalletService, private cdr: ChangeDetectorRef, private websocketService: WebsocketService, private zone: NgZone) {
    this.loadHostBankAccounts();
  }

  ngOnInit(): void {
    this.loadWalletData();
    this.loadTransactions();

    this.loadTransactions();

    this.initRealtimeListener();

  }
  // 4. HÀM KÉO THẺ TỪ DB LÊN
  loadHostBankAccounts() {
    // Sau này ông đổi thành: this.walletService.getSavedBankAccounts().subscribe(...)
    // Giờ tôi mock sẵn cấu trúc chuẩn để ông test UI ăn ngay:
    this.savedBanks = [
      {
        id: 1,
        bankName: 'Vietcombank',
        bankCode: 'VCB',
        accountNumber: '1023456789', // Số tài khoản full không che
        accountHolderName: 'NGUYEN VAN A',
        isDefault: true
      },
      {
        id: 2,
        bankName: 'Techcombank',
        bankCode: 'TCB',
        accountNumber: '19035489761023', // Số tài khoản full không che
        accountHolderName: 'NGUYEN VAN A',
        isDefault: false
      }
    ];

    const defaultBank = this.savedBanks.find(b => b.isDefault);
    this.selectedBank = defaultBank ? defaultBank : this.savedBanks[0];
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
    if (!this.selectedBank) {
      this.toastService.error('Lỗi', 'Vui lòng chọn ngân hàng nhận tiền.');
      return;
    }

    this.isLoading = true;

    // ĐÃ SỬA: Đóng gói payload rã trường sạch sẽ, ép kiểu theo Interface WithdrawRequest
    const payload: WithdrawRequest = {
      amount: this.withdrawAmount,
      bankName: this.selectedBank.bankName,
      accountNumber: this.selectedBank.accountNumber,
      accountHolderName: this.selectedBank.accountHolderName
    };

    // Gọi API đẩy cục JSON sạch này xuống cho Spring Boot nuốt
    this.walletService.requestWithdraw(payload).subscribe({
      next: (res) => {
        this.toastService.success('Thành công', 'Yêu cầu rút tiền của bạn đã được gửi đi và đang chờ xử lý bởi Admin.');
        this.withdrawAmount = null;
        this.loadWalletData();
        this.loadTransactions();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Lỗi', err.error?.message || 'Có lỗi xảy ra khi tạo lệnh rút tiền.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
  getTxColor(type: string): string {
    const map: Record<string, string> = {
      'WITHDRAWAL': 'text-stone-900',
      'REFUND_DEDUCTION': 'text-stone-900',
      'BOOKING_REVENUE': 'text-emerald-600',
      'CANCELLATION_FEE_REVENUE': 'text-emerald-600'
    };
    return map[type] || 'text-stone-600';
  }// Thêm vào class Component

}