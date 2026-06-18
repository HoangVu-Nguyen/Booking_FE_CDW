import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomestayService } from '../../../../core/services/homestay/homestay.service'; // Điều chỉnh lại path nếu cần

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  required?: boolean;
}

@Component({
  selector: 'app-manage-property',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-property.html',
  styleUrl: './manage-property.css',
})
export class ManageProperty implements OnInit {
  private route = inject(ActivatedRoute);
  private homestayService = inject(HomestayService); // TIÊM SERVICE VÀO ĐÂY

  homestayId = signal<string | null>(null);
  homestayName = signal<string>('Đang tải dữ liệu...');
  
  // Đổi thành Signal để HTML tự động update mượt mà
  completionPercent = signal<number>(0); 

  menuItems: MenuItem[] = [
    { id: 'info', label: 'Thông tin cơ bản', icon: 'info', path: 'info', required: true },
    { id: 'rooms', label: 'Phòng & giường', icon: 'bed', path: 'rooms', required: true },
    { id: 'photos', label: 'Hình ảnh', icon: 'photo_library', path: 'photos', required: true },
    { id: 'amenities', label: 'Tiện nghi', icon: 'wifi', path: 'amenities', required: false },
    {id:'room/amenities',label: 'Tiện nghi Phòng', icon: 'wifi', path: 'room/amenities', required: false},
    { id: 'pricing', label: 'Giá & phụ phí', icon: 'payments', path: 'pricing', required: true },
    { id: 'policies', label: 'Chính sách', icon: 'policy', path: 'policies', required: false }
  ];

  ngOnInit(): void {
    // Theo dõi sự thay đổi của ID trên URL
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      if (id) {
        this.homestayId.set(id);
        this.loadOverviewData(id); // Gọi API
      }
    });
  }

  // ==========================================
  // HÀM LẤY DỮ LIỆU TỪ BACKEND ĐỔ RA LAYOUT
  // ==========================================
  private loadOverviewData(id: string): void {
    this.homestayService.getHomestayById(Number(id)).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const data = res.data;
          
          // 1. Cập nhật tên Homestay lên Header
          this.homestayName.set(data.name || 'Chưa cập nhật tên');

          // 2. Thuật toán "chấm điểm" hoàn thiện hồ sơ
          let completedPoints = 0;
          const totalPoints = 5; // Tạm tính 5 tiêu chí cơ bản

          if (data.name) completedPoints++;
          if (data.categoryId) completedPoints++;
          if (data.addressDetail) completedPoints++;
          if (data.latitude && data.longitude) completedPoints++;
          if (data.description && data.description.length > 50) completedPoints++;

          // Tính ra % (Nhân với 20% mỗi tiêu chí)
          const percent = Math.round((completedPoints / totalPoints) * 100);
          this.completionPercent.set(percent);
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải thông tin tổng quan chỗ nghỉ:', err);
        this.homestayName.set('Không thể tải dữ liệu');
      }
    });
  }
}