import { Component, inject } from '@angular/core';
import { UserService } from '../../../../core/services/user/user.service';
import { PastTripList } from './components/past-trip-list/past-trip-list';
@Component({
  selector: 'app-profile-info',
  imports: [PastTripList],
  templateUrl: './profile-info.html',
  styleUrl: './profile-info.css',
})
export class ProfileInfo  {
  private userService = inject(UserService);
  public userInfo = this.userService.userHeader;
  
}
