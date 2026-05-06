import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig & { useIdTokenHintForLogout?: boolean } = {
   issuer: 'https://localhost:8443',
  //issuer: 'https://vcebook.io.vn',
  clientId: 'clyvasync-client',
  responseType: 'code',

  scope: 'openid profile email offline_access',
  dummyClientSecret: 'secret-khong-ma-hoa',

  redirectUri: (typeof window !== 'undefined') 
                ? window.location.origin + '/callback' 
                : 'https://localhost:4200/callback',

  // 1. Đảm bảo URI này khớp 100% với DB (không thừa dấu /)
  postLogoutRedirectUri: 'https://localhost:4200/login',

  // 2. QUAN TRỌNG: Xóa hoặc Comment dòng logoutUrl đi
  // Spring Authorization Server sẽ tự cung cấp endpoint qua Discovery Document (.well-known)
  // Nếu muốn ép buộc, hãy dùng đúng endpoint: 
  // logoutUrl: 'https://localhost:8443/connect/logout', 

  disablePKCE: false,
  requireHttps: true, // Vì bạn đang dùng https://localhost:8443 nên hãy để true

  // 3. Thêm cấu hình này để thư viện tự lấy ID Token từ storage
  useIdTokenHintForLogout: true, 

  showDebugInformation: true, // Bật lên để xem log ở Console trình duyệt
};