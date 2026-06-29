import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private getDeviceId(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('deviceId') || '';
    }
    return '';
  }

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Device-Id': this.getDeviceId(),
      'Accept': 'application/json'
    });

    const token = this.oauthService.getAccessToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  private _request(
    method: string,
    endpoint: string,
    body?: any,
    params?:HttpParams| any
  ): Observable<any> {
    const options = {
      body,
      headers: this.buildHeaders(),
      params: new HttpParams({ fromObject: params || {} }),
      withCredentials: true 
    };

    return this.http.request(method, `${this.apiUrl}${endpoint}`, options).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      console.warn('Phiên đăng nhập hết hạn, đang điều hướng...');
      this.oauthService.logOut();
     
    }
    
    return throwError(() => error);
  }


  public get<T>(endpoint: string, params?: any): Observable<T> {
    return this._request('GET', endpoint, null, params);
  }

  public post<T>(endpoint: string, body: any, params?: any): Observable<T> {
    return this._request('POST', endpoint, body, params);
  }

  public put<T>(endpoint: string, body: any, params?: any): Observable<T> {
    return this._request('PUT', endpoint, body, params);
  }

  public delete<T>(endpoint: string, body?: any, params?: any): Observable<T> {
    return this._request('DELETE', endpoint, body, params);
  }
  public patch<T>(endpoint: string, body: any = {}, params?: any): Observable<T> {
    return this._request('PATCH', endpoint, body, params);
}
public getText(endpoint: string, params?: any): Observable<string> {
  const options = {
    headers: this.buildHeaders(),
    params: new HttpParams({ fromObject: params || {} }),
    responseType: 'text' as 'json', // Trick để ép kiểu nhận string từ HttpClient
    withCredentials: true
  };

  return this.http.get(`${this.apiUrl}${endpoint}`, options).pipe(
    map(res => res as unknown as string),
    catchError((error: HttpErrorResponse) => this.handleError(error))
  );
}
}