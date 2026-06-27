import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { TokenService } from './core/services/token.service';
import { authCodeFlowConfig } from './core/configs/auth.config';
import { HybridStorage } from './core/configs/hybrid-storage';
import { AuthService } from './core/services/auth.service';
import {Toast} from './shared/components/toast/toast';
import {Confirm} from "./shared/components/confirm/confirm";
import{ChatWidget} from "./shared/components/chat-widget/chat-widget";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast, Confirm, ChatWidget],
  templateUrl: './app.html'
})
export class App implements OnInit {
  protected readonly title = signal('Clyvasync_Network');
  protected isInitialized = signal(false);
  constructor(
    private oauthService: OAuthService,
    private router: Router,
    private tokenService: TokenService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  async ngOnInit() {
    this.router.events.subscribe(event => {
    if (event instanceof NavigationStart) {
      console.log(">>> Đang chuyển hướng tới:", event.url);
      // Khi thấy log hiện "Đang chuyển hướng tới: /login"
      // Ông hãy nhìn vào "Stack Trace" hoặc xem component nào gọi nó
      console.trace(); // Lệnh này cực hay, nó in ra toàn bộ luồng gọi hàm dẫn đến lệnh navigate
    }
  });
    if (isPlatformBrowser(this.platformId)) {
      this.oauthService.setStorage(new HybridStorage());
      const baseUrl = window.location.origin;
      this.oauthService.configure({
        ...authCodeFlowConfig,
        redirectUri: baseUrl + '/callback',
        useSilentRefresh: false
      });
      this.oauthService.setupAutomaticSilentRefresh();

      try {
        await this.oauthService.loadDiscoveryDocument();

        // LUỒNG A: Xử lý Login Redirect
        if (window.location.search.includes('code=')) {
          await this.oauthService.tryLogin();
          if (this.oauthService.hasValidAccessToken()) {
            console
            this.tokenService.setAccessToken(this.oauthService.getAccessToken());
            console.log(this.tokenService.getAccessToken())
            // 🔥 QUAN TRỌNG: Set initialized trước khi navigate
            this.isInitialized.set(true);

            // Sau đó mới xóa params trên URL và về trang chủ
            await this.router.navigate(['/'], { replaceUrl: true });
            
            return; // Thoát hàm luôn vì đã xong
          }
        }

        // LUỒNG B: F5 hồi sinh token
        else if (!this.oauthService.hasValidAccessToken() && this.oauthService.getRefreshToken()) {
          try {
            await this.oauthService.refreshToken();
            this.tokenService.setAccessToken(this.oauthService.getAccessToken());
            console.log(this.tokenService.getAccessToken())
            this.isInitialized.set(true);

          } catch (err) {
            console.warn('Refresh Token hỏng:', err);
            localStorage.removeItem('has_cookie_token');
          }
        }
      } catch (error) {
        console.error('OAuth Error:', error);
      } finally {
        // Chỉ set true nếu luồng A không thực hiện navigate ở trên
        if (!this.isInitialized()) {
          this.isInitialized.set(true);
        }
      }
    }
  }
}