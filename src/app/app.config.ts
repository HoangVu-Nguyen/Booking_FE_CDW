import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router'; // Thêm các tính năng router
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes(':8443')) {
    req = req.clone({
      withCredentials: true
    });
  }
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    
    provideHttpClient(
      withFetch(), 
      withInterceptors([credentialsInterceptor])
    ), 

    provideOAuthClient(), 

    // CẤU HÌNH ROUTER MƯỢT MÀ
    provideRouter(
      routes,
      // 1. Kích hoạt hiệu ứng chuyển cảnh "biến hình" giữa các trang
      withViewTransitions(), 
      // 2. Tự động cuộn lên đầu trang khi chuyển sang Homestay mới
      withInMemoryScrolling({ 
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ), 

    provideClientHydration(withEventReplay())
  ]
};