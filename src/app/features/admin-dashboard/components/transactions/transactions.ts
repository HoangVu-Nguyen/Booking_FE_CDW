import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LedgerTransaction, LedgerKpiResponse } from '../../../../core/models/response/ledger.response';
import { WalletService } from '../../../../core/services/wallet/wallet.service';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../../../core/services/admin/admin.service';
Chart.register(...registerables);

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule], // Nhớ import FormsModule
  templateUrl: './transactions.html'
})
export class Transactions implements OnInit {

  // 1. STATE LƯU TRỮ DỮ LIỆU TỪ API
  transactions: LedgerTransaction[] = [];
  kpiData: LedgerKpiResponse | null = null;

  // 2. STATE QUẢN LÝ PHÂN TRANG & TÌM KIẾM
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  searchQuery: string = '';
  currentType: string = 'ALL';
  isLoading: boolean = false;
  filter: string = 'MONTH';
  private revenueChart: Chart | null = null;
  private adminService = inject(AdminService)
  @ViewChild('revenueChart') revenueChartRef!: ElementRef;

  // 3. INJECT SERVICE VÀO
  constructor(private walletService: WalletService, private cdr: ChangeDetectorRef) { }

  // 4. CHẠY NGAY KHI COMPONENT VỪA RENDER
  ngOnInit(): void {
    this.loadKpiData();
    this.loadTransactions();
  }

  // ==========================================
  // CALL API GIAO TIẾP VỚI BACKEND
  // ==========================================
  loadKpiData() {
    this.walletService.getLedgerKpi().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.kpiData = res.data;
          this.onFilterChange("WEEK")
          this.cdr.detectChanges();
        
        }
      },
      error: (err) => console.error('Lỗi khi tải KPI:', err)
    });
  }

  loadTransactions() {
    this.isLoading = true;
    this.walletService.getLedgerTransactions(this.currentPage, this.pageSize, this.searchQuery, this.currentType)
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.transactions = res.data.content;
            this.totalElements = res.data.totalElements;
            this.totalPages = res.data.totalPages;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách giao dịch:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
  // ==========================================
  // CÁC HÀM XỬ LÝ SỰ KIỆN TỪ GIAO DIỆN (UI)
  // ==========================================

  // Gọi khi user gõ vào ô tìm kiếm và nhấn Enter
  onSearch() {
    this.currentPage = 0; // Đổi từ khóa thì phải reset về trang 1 (index 0)
    this.loadTransactions();
  }

  // Gọi khi user bấm nút Lọc (PAYMENT_IN, PAYOUT_OUT...)
  onFilterType(type: string) {
    this.currentType = type;
    this.currentPage = 0;
    this.loadTransactions();
  }

  // Gọi khi user bấm nút "Trang trước", "Trang sau"
  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  // ==========================================
  // RENDER UI CONFIG (Đã bổ sung trạng thái thực tế từ DB)
  // ==========================================
  getStatusConfig(status: string) {
    const configs: Record<string, any> = {
      // Chờ xử lý (áp dụng cho lệnh rút tiền mới tạo hoặc doanh thu đang giam)
      'PENDING': { bg: 'bg-amber-50', border: 'border-amber-200/60', text: 'text-amber-700', dot: 'bg-amber-500 animate-pulse', label: 'Chờ xử lý' },

      // Kế toán đang xử lý chuyển khoản
      'PROCESSING': { bg: 'bg-blue-50', border: 'border-blue-200/60', text: 'text-blue-700', dot: 'bg-blue-500 animate-pulse', label: 'Đang giao dịch' },

      // Giao dịch thành công
      'COMPLETED': { bg: 'bg-[#173124]/5', border: 'border-[#173124]/10', text: 'text-[#173124]', dot: 'bg-[#173124]', label: 'Thành công' },

      // Giao dịch thất bại / Bị Admin từ chối
      'FAILED': { bg: 'bg-rose-50', border: 'border-rose-200/60', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Thất bại' }
    };

    // Fallback an toàn nếu có mã lạ
    return configs[status] || configs['PENDING'];
  }

  getTypeConfig(type: string) {
    const configs: Record<string, any> = {
      // Tiền vào (Booking Revenue)
      'PAYMENT_IN': { icon: 'arrow_downward', color: 'text-emerald-600', bg: 'bg-emerald-50' },

      // Tiền ra (Withdrawal)
      'PAYOUT_OUT': { icon: 'arrow_upward', color: 'text-indigo-600', bg: 'bg-indigo-50' },

      // Tiền hoàn lại (Refund)
      'REFUND': { icon: 'keyboard_return', color: 'text-rose-600', bg: 'bg-rose-50' }
    };

    // Fallback an toàn
    return configs[type] || configs['PAYMENT_IN'];
  }
 

  
  onFilterChange(type: string) {
    this.filter = type;
    this.isLoading = true;

    this.adminService.getRevenueReport(type).subscribe({
      next: (res) => {
        console.log(res)
        if (res && res.data) {

          const { labels, revenue, gmv } = res.data;
          this.updateRevenueChart(labels, revenue, gmv);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi lấy dữ liệu biểu đồ:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  updateRevenueChart(labels: string[], dataRevenue: number[], dataGmv: number[]) {
    // 1. Kiểm tra kỹ trước khi hủy
    if (this.revenueChart instanceof Chart) {
      this.revenueChart.destroy();
      this.revenueChart = null; 
    }

    const canvas = this.revenueChartRef.nativeElement;
    const ctx = canvas.getContext('2d');

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Doanh thu thuần',
            data: dataRevenue,
            borderColor: '#10b981',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 8
          },
          {
            label: 'GMV',
            data: dataGmv,
            borderColor: '#d6d3d1',
            backgroundColor: 'transparent',
            borderDash: [6, 6],
            tension: 0.4,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f7f7f7' }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#a8a29e' } },
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#a8a29e' } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#173124', padding: 12, cornerRadius: 8, bodyFont: { weight: 'bold' } }
        }
      }
    });
    this.cdr.detectChanges();
  }
}