import { Component, EventEmitter, Output, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService } from '../../../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css',
})
export class PropertyList implements OnInit {
  private adminService = inject(AdminService);
  private changeRef = inject(ChangeDetectorRef);

  pendingProperties: any[] = [];
  isLoading = true;

  @Output() viewProperty = new EventEmitter<any>();

  ngOnInit(): void {
    this.fetchPendingProperties();
  }

  // Hàm này ông sẽ gọi từ Approvals component qua @ViewChild khi duyệt xong
  fetchPendingProperties() {
    this.isLoading = true;
    this.adminService.getPendingProperties().subscribe({
      next: (response) => {
        // Kiểm tra an toàn: nếu response có data thì lấy data, không thì lấy chính response
        // Cách này giúp code chạy ổn định dù Backend thay đổi cấu trúc trả về
        this.pendingProperties = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
        
        console.log('Dữ liệu đã load:', this.pendingProperties);
        this.isLoading = false;
        this.changeRef.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách tài sản chờ duyệt:', err);
        this.isLoading = false;
      }
    });
  }

  openDocumentViewer(property: any) {
    this.viewProperty.emit(property);
  }

  getAvatarColor(name: string): string {
    if (!name) return 'bg-stone-500';
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}