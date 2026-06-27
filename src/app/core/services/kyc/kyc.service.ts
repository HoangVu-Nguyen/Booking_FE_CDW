import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ApiResponse } from '../../models/response/api.response';
import { HostKycProfileRequest } from '../../models/request/host-kyc-profile.request';
import { KycBatchUploadRequest } from '../../models/request/kyc-batch-upload.request';
import { PreUploadResponse } from '../../models/response/pre-upload.response';


@Injectable({
    providedIn: 'root'
})
export class KycService {

    constructor(private apiService: ApiService) { }
    private profileIdSubject = new BehaviorSubject<number | null>(null);
    profileId$ = this.profileIdSubject.asObservable();
    /**
     * Bước 1: Gửi thông tin định danh (CCCD & Bank)
     * Trả về Long (profileId) để Frontend dùng cho bước tiếp theo
     */
    createProfile(request: HostKycProfileRequest): Observable<ApiResponse<number>> {
        const endpoint = `/api/v1/kyc/profile`;
        return this.apiService.post<ApiResponse<number>>(endpoint, request);
    }

    /**
     * Bước 2: Upload các tài liệu (CCCD, Sổ đỏ, v.v.)
     * @param batchRequest Chứa profileId và danh sách file meta
     * @param files Danh sách các file thực tế từ input type="file"
     */
    uploadDocuments(batchRequest: KycBatchUploadRequest, files: File[]): Observable<ApiResponse<any>> {
        const endpoint = `/api/v1/kyc/upload`;

        // Sử dụng FormData để gửi file cùng với dữ liệu JSON
        const formData = new FormData();
        formData.append('batchRequest', JSON.stringify(batchRequest));
        files.forEach((file, index) => {
            formData.append('files', file, file.name);
        });

        return this.apiService.post<ApiResponse<any>>(endpoint, formData);
    }
    setProfileId(id: number): void {
        this.profileIdSubject.next(id);
    }

    // Hàm getter: Lấy giá trị hiện tại
    getProfileId(): number | null {
        return this.profileIdSubject.getValue();
    }
    preUpload(request: KycBatchUploadRequest): Observable<ApiResponse<PreUploadResponse[]>> {
        const endpoint = `/api/v1/kyc/pre-upload`;
        return this.apiService.post<ApiResponse<PreUploadResponse[]>>(endpoint, request);
    }
    confirmUpload(documentIds: number[]): Observable<ApiResponse<void>> {
        const endpoint = `/api/v1/kyc/confirm-upload`;
        return this.apiService.post<ApiResponse<void>>(endpoint, documentIds);
    }
}