import { ChangeDetectorRef, Component, computed, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { UserService } from '../../../../core/services/user/user.service';
import { AuthConfig, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';
import { UserHeaderResponse } from '../../../../core/models/response/user-header.response';
import { authCodeFlowConfig } from '../../../../core/configs/auth.config';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../../../shared/components/directives/click-outside.directive';
import { NotificationMenu } from './components/notification-menu/notification-menu';
import { MessageMenu } from './components/message-menu/message-menu';
@Component({
  selector: 'app-user-profile',
  imports: [RouterModule, CommonModule,ClickOutsideDirective, NotificationMenu, MessageMenu],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit {
  userHeaderResponse!: UserHeaderResponse;
  isOpen = false;
  isNotifOpen = false;      // Của Notification Menu
  isMessageOpen = false;
  private userService = inject(UserService);
  public userInfo = this.userService.userHeader;
  constructor(private eRef: ElementRef, private oauthService: OAuthService, private cdr: ChangeDetectorRef, private storage: OAuthStorage) {

  }
  ngOnInit(): void {

    console.log(this.oauthService.getAccessToken())
    console.log(this.oauthService.getRefreshToken())
    if (this.oauthService.hasValidAccessToken()) {
      if (!this.userInfo()) {
        this.userService.fetchHeaderInfo();
        console.log(this.userInfo())

      }



    }
  }
  get userRoles(): string[] {
    const claims = this.oauthService.getIdentityClaims() as any;
    if (!claims) return [];

    // Lưu ý: Nhớ console.log(claims) ra xem cấu trúc thực tế của Backend trả về
    // Có thể là claims['roles'], claims['authorities'], hoặc claims['realm_access']?.['roles']
    return claims['roles'] || [];
  }
  isHost = computed(() => {
    return this.userRoles.includes('ROLE_HOST');
  });

  isAdmin = computed(() => {
    return this.userRoles.includes('ROLE_ADMIN');
  });



  logout() {
    // 1. Lấy ID Token trực tiếp từ HybridStorage (đang nằm trong RAM)
    const idToken = this.oauthService.getIdToken();

    if (!idToken) {
      console.warn("Không tìm thấy ID Token trong RAM, có thể bạn đã F5 hoặc mất session");
    }

    // 2. Cấu hình các tham số logout
    const postLogoutUri = authCodeFlowConfig.postLogoutRedirectUri ?? window.location.origin; // default to current origin if undefined
    const encodedPostLogout = encodeURIComponent(postLogoutUri);
    const encodedIdToken = encodeURIComponent(idToken ?? '');
    const logoutUrl = `https://localhost:8443/connect/logout?id_token_hint=${encodedIdToken}&post_logout_redirect_uri=${encodedPostLogout}`;

    // 3. Xóa sạch dấu vết ở Client (Access Token trong RAM, Cookie Flag ở LocalStorage)
    this.oauthService.logOut(true);
    localStorage.removeItem('has_cookie_token');

    // 4. Chuyển hướng thủ công sang Server xác thực
    window.location.href = logoutUrl;
  }
  toggleNotif() {
    this.isNotifOpen = !this.isNotifOpen;
    if (this.isNotifOpen) {
      this.isOpen = false;
      this.isMessageOpen = false;
    }
  }

  // Hàm chuyển đổi Tin nhắn
  toggleMessage() {
    this.isMessageOpen = !this.isMessageOpen;
    if (this.isMessageOpen) {
      this.isOpen = false;
      this.isNotifOpen = false;
    }
  }

  // Cập nhật lại hàm toggleMenu cũ
  toggleMenu() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isNotifOpen = false;
      this.isMessageOpen = false;
    }
  }
  closeAllPopups() {
    this.isOpen = false;
    this.isNotifOpen = false;
    this.isMessageOpen = false;
  }
}
