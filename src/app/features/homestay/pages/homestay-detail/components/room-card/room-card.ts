import { Component, computed, input, output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { RoomResponse } from '../../../../../../core/models/response/room.response';
import { BookingService } from '../../../../../../core/services/booking/booking.service';
import { SharedImageLightbox } from '../../../../../../shared/components/shared-image-lightbox/shared-image-lightbox';
import { BedResponse, CalendarRoomResponse } from '../../../../../../core/models/response/calendar.response';
import { LightboxImage } from '../../../../../../core/models/image/image.model';
@Component({
  selector: 'app-room-card',
  imports: [CommonModule,SharedImageLightbox],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css',
})
export class RoomCard {
  constructor(private bookingService:BookingService){

  }
room = input.required<RoomResponse>();
  nights = input.required<number>();
  select = output<any>();
  @ViewChild('lightbox') lightbox!: SharedImageLightbox;

  // Signal quản lý đóng mở bảng giá
  isExpanded = signal(false);

  toggleRates() {
    this.isExpanded.update(v => !v);
  }

  onSelect(plan: any) {
    this.select.emit({ room: this.room(), plan: plan });
  }

  // Hàm tính giá thấp nhất để hiện ở chế độ thu gọn
  getMinPrice() {
    const plans = this.room().ratePlans || [];
    if (plans.length === 0) return 0;
    return Math.min(...plans.map((p: any) => p.price));
  }
  onSelectRoom(room:RoomResponse,plan: any,count:number) {
  // Bắn data lên Service để Widget nhận được
  this.bookingService.selectPlan(room,plan,count);
  

}
 getCoverImage(room: RoomResponse): string {
    if (!room.images || room.images.length === 0) {
      return 'assets/images/default-room.jpg'; // Ảnh dự phòng
    }
    const cover = room.images.find(img => img.isCover);
    return cover ? cover.url : room.images[0].url;
  }

  // 2. Hàm mở Lightbox
  openRoomGallery(room: RoomResponse) {
    if (!room.images || room.images.length === 0) return;

    const lightboxData: LightboxImage[] = room.images.map(img => ({
      url: img.url,
      isCover: img.isCover,
      caption: `Ảnh ${room.name}`
    }));

    this.lightbox.open(lightboxData, 0); 
  }

  // 3. Hàm tạo Tooltip mô tả chi tiết giường
  getBedTooltip(beds: BedResponse[]): string {
    if (!beds || beds.length === 0) return 'Thông tin giường đang cập nhật';
    // Ví dụ trả về: "1 giường KING, 2 giường SINGLE"
    return beds.map(b => `${b.quantity} giường ${b.type}`).join(', ');
  }
range(count: number | null | undefined): number[] {
  const safeCount = Math.max(Number(count || 0), 0);
  return Array.from({ length: safeCount }, (_, index) => index + 1);
}
}
