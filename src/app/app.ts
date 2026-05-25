import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { TokenService } from './core/services/token.service';
import { authCodeFlowConfig } from './core/configs/auth.config';
import { HybridStorage } from './core/configs/hybrid-storage';
import { AuthService } from './core/services/auth.service';
import {Toast} from './shared/components/toast/toast';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast],
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