import { Component, inject } from '@angular/core';
import { UserService } from '../../../../core/services/user/user.service';

@Component({
  selector: 'app-profile-info',
  imports: [],
  templateUrl: './profile-info.html',
  styleUrl: './profile-info.css',
})
export class ProfileInfo {
  private userService = inject(UserService);
  public userInfo = this.userService.userHeader;
  
}
