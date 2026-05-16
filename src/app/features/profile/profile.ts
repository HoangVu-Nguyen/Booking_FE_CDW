import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../core/services/user/user.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-profile',
  imports: [RouterOutlet,RouterLink,RouterLinkActive,DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private userService = inject(UserService);
  public userInfo = this.userService.userHeader;
}
