// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Chỉ đính kèm cho request tới Backend của bạn
  if (req.url.includes('vunguyen.tokyo')) {
    req = req.clone({
      withCredentials: true
    });
  }
  return next(req);
};