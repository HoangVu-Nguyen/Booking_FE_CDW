import { Component, inject } from '@angular/core';
import { UserService } from '../../../../core/services/user/user.service';

@Component({
  selector: 'app-checkout-contact',
  imports: [],
  templateUrl: './checkout-contact.html',
  styleUrl: './checkout-contact.css',
})
export class CheckoutContact {
  private userService = inject(UserService);
  public userInfo = this.userService.userHeader;
}
