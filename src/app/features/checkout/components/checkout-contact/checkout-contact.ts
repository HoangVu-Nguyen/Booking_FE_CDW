import { Component, effect, inject } from '@angular/core';
import { UserService } from '../../../../core/services/user/user.service';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../../core/services/booking/booking.service';
@Component({
  selector: 'app-checkout-contact',
  imports: [FormsModule],
  templateUrl: './checkout-contact.html',
  styleUrl: './checkout-contact.css',
})
export class CheckoutContact {
  private userService = inject(UserService);
  public userInfo = this.userService.userHeader;
  public bookingService = inject(BookingService); // Injec
  // Khai báo biến cục bộ để bind vào Form HTML
  contact = {
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    specialRequests: ''
  };

  constructor() {
    effect(() => {
      const user = this.userInfo();
      if (user && !this.contact.guestName) {
        this.contact.guestName = user.username || '';
        this.contact.guestPhone = user.phoneNumber || '';
        this.contact.guestEmail = user.email || '';
        this.onContactChange(); // Cập nhật sang Service luôn
      }
    });
  }

  // Hàm này gọi mỗi khi người dùng gõ vào các ô input
  onContactChange() {
    this.bookingService.contactInfo.set(this.contact);
  }
}
