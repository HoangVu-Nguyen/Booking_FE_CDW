import { Component, inject, signal } from '@angular/core';
import { BookingTimeline } from './components/booking-timeline/booking-timeline';
import { BookingReviewBanner } from './components/booking-review-banner/booking-review-banner';
import { BookingMainInfo } from './components/booking-main-info/booking-main-info';
import { BookingGallery } from './components/booking-gallery/booking-gallery';
import { BookingConcierge } from './components/booking-concierge/booking-concierge';
import { BookingMap } from './components/booking-map/booking-map';
import { ActivatedRoute } from '@angular/router';
import { TripService } from '../../../../core/services/trip/trip.service';
import { BookingRulesModal } from './components/booking-rules-modal/booking-rules-modal';
import { ConfirmationService } from '../../../../core/services/confirm/confirm.service';
import { BookingService } from '../../../../core/services/booking/booking.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-my-trip',
  imports: [BookingTimeline, BookingReviewBanner, BookingMainInfo, BookingGallery, BookingConcierge, BookingMap, BookingRulesModal,CommonModule],
  templateUrl: './my-trip.html',
  styleUrl: './my-trip.css',
})
export class MyTrip {
  private route = inject(ActivatedRoute);
  public tripService = inject(TripService);
  public isRulesModalOpen = signal<boolean>(false);
  private confirmService = inject(ConfirmationService);
  public bookingService = inject(BookingService);
  private toastService = inject(ToastService);
  ngOnInit(): void {
    const bookingCode = this.route.snapshot.paramMap.get('code');

    if (bookingCode) {
      // 2. Gọi API kéo data về
      this.tripService.fetchTripDetail(bookingCode);

      console.log(this.tripService.currentTripDetail())
    }
  }

  ngOnDestroy(): void {
    this.tripService.clearTripDetail();
  }
  public setRulesModalState(isOpen: boolean): void {
    this.isRulesModalOpen.set(isOpen);
  }
  onCancelBooking() {
    const detail = this.tripService.currentTripDetail();
    if (!detail) return;

    const bookingCode = detail.bookingCode;

    // 1. Gọi API lấy dữ liệu xem trước (Preview)
    this.bookingService.previewCancelBooking(bookingCode).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const previewData = res.data;
          console.log('Dữ liệu preview hủy phòng:', previewData);

          // Helper format tiền tệ VNĐ
          const formatVND = (amount: number) => {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
          };

          // 2. Tạo nội dung thông báo động dựa trên kết quả tính toán
          let confirmMessage = `Bạn đang yêu cầu hủy đặt phòng tại <strong>${detail.property.name}</strong>.<br><br>`;

          if (previewData.totalPaid > 0) {
            confirmMessage += `<div style="text-align: left; background: #f9fafb; padding: 10px; border-radius: 8px;">`;
            confirmMessage += `<strong>Chính sách:</strong> ${previewData.refundPolicyMessage}<br><br>`;
            confirmMessage += `• Tổng tiền đã thanh toán: ${formatVND(previewData.totalPaid)}<br>`;
            confirmMessage += `• Phí phạt hủy phòng: <span style="color: #dc2626;">${formatVND(previewData.penaltyFee)}</span><br>`;
            confirmMessage += `• Số tiền nhận lại: <strong style="color: #059669; font-size: 1.1em;">${formatVND(previewData.refundAmount)}</strong>`;
            confirmMessage += `</div><br>`;
            confirmMessage += `Tiền hoàn sẽ được chuyển về tài khoản của bạn trong 3-5 ngày làm việc. `;
          } else {
            // Trường hợp chưa thanh toán
            confirmMessage += `<div style="color: #059669; margin-bottom: 15px;">${previewData.refundPolicyMessage}</div>`;
          }

          confirmMessage += `Bạn có chắc chắn muốn hủy đơn này?`;

          // 3. Hiển thị Popup xác nhận
          this.confirmService.confirm(
            "Xác nhận chi tiết hủy phòng",
            confirmMessage,
            () => {
              // 4. Nếu Khách hàng ấn "Đồng ý", tiến hành gọi API hủy thật
              this.bookingService.cancelBooking(bookingCode).subscribe({
                next: (cancelRes) => {
                  if (cancelRes.success) {
                    console.log('Đã xác nhận hủy đặt phòng mã:', bookingCode);
                    this.toastService.success('Hủy đặt phòng thành công', `Đơn đặt phòng ${bookingCode} đã được hủy.`);
                    this.tripService.fetchTripDetail(bookingCode);
                  }
                },
                error: (err) => {
                  console.error('Lỗi khi thực hiện hủy đơn:', err);
                  // TODO: Hiển thị thông báo lỗi (Toast/Alert)
                }
              });
            }
          );
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi preview:', err);
        // TODO: Xử lý lỗi lấy thông tin preview (Ví dụ: Toast "Không thể lấy thông tin hủy, vui lòng thử lại sau")
      }
    });
  }
}
