// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterRequest, AuthResponse } from '../models/auth.model';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root' // Service này có thể dùng ở bất cứ đâu
})
export class AuthService {
  private readonly API_URL = 'https://localhost:8443/api/v1/auth'; 

  constructor(private http: HttpClient, private oauthService: OAuthService) {}

  // Hàm gọi đăng ký
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data);
  }

  // Hàm gọi verify OTP (nếu cần)
  verifyOTP(email: string, code: string): Observable<any> {
    return this.http.post(`${this.API_URL}/verify-account`, { email, code });
  }
  refreshAccessToken() {
    return this.http.post<any>(
      `${this.API_URL}/refresh`,
      {},
      { withCredentials: true }
    );
  }
  getRolesFromToken(): string[] {
  // Lấy payload của token đã lưu trong RAM
  const claims = this.oauthService.getIdentityClaims(); 
  
  if (!claims) return [];

  // Tùy cấu hình server mà key có thể là 'roles', 'realm_access.roles', hoặc 'authorities'
  return claims['roles'] || []; 
}
}