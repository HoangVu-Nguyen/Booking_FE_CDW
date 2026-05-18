import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-map.html',
  styleUrl: './booking-map.css',
})
export class BookingMap {
  // Hứng dữ liệu từ Component cha
  @Input({ required: true }) name!: string;
  @Input({ required: true }) address!: string;
  @Input() lat!: number;
  @Input() lng!: number;
  
  // Dùng ảnh đầu tiên của homestay làm nền, hoặc ảnh mặc định nếu không truyền
  @Input() image: string = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop';

  /**
   * Tính năng mở Google Maps điều hướng tự động
   */
  public openDirections(): void {
    if (this.lat && this.lng) {
      // Dùng API mở URL của Google Maps trỏ thẳng đến tọa độ
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${this.lat},${this.lng}`;
      window.open(googleMapsUrl, '_blank'); // Mở sang tab mới
    } else {
      console.warn("Chưa có tọa độ chính xác cho Homestay này.");
    }
  }
}