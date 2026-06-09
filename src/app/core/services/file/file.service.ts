import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ImageType } from '../../enum/image-type.enum';
import { ApiService } from '../api/api.service';
import { ApiResponse } from '../../models/response/api.response';

export interface PresignedUrlResponse {
  uploadUrl: string; // URL chứa token của AWS để PUT file lên
  objectKey: string; // Đường dẫn nháp lưu trong DB (VD: chat/user_1/abc.png)
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private apiService = inject(ApiService);
  private httpBackend = inject(HttpBackend);

  // MẸO XƯƠNG MÁU: Tạo HttpClient "SẠCH" bằng HttpBackend
  // Nó sẽ bypass qua ApiService cũ và các Interceptor hệ thống, không bị dính apiUrl hay Bearer token rác
  private pureHttp = new HttpClient(this.httpBackend);

  /**
   * Cỗ máy xử lý vạn năng: Nhận mảng file thật -> Xin Presigned URL -> Đẩy thẳng lên S3 -> Trả về objectKeys
   */
  async uploadBatchFiles(files: File[],imageType:ImageType): Promise<PresignedUrlResponse[]> {
    if (!files || files.length === 0) return [];

    // 1. Gom thông tin thô để xin lệnh upload từ Backend nhà mình
    const bodyRequest = {
      items: files.map(file => ({
        fileName: file.name,
        contentType: file.type,
        imageType:imageType,
        fileSize: file.size
      }))
    };

    // Gọi qua ApiService xịn của ông để tự động ăn theo BaseURL và Token đăng nhập của hệ thống
    const res = await firstValueFrom(
      this.apiService.post<ApiResponse<any>>('/api/v1/chat/attachments/prepare', bodyRequest)
    );
    const presignedList: PresignedUrlResponse[] = res.data;

    // 2. Có URL của AWS rồi, tiến hành dùng HttpClient SẠCH bắn thẳng file lên mây S3
    for (let i = 0; i < files.length; i++) {
      const fileReal = files[i];
      const s3Info = presignedList[i];

      // Đặt đúng Content-Type của file để AWS nhận diện không bị hỏng file
      const headers = new HttpHeaders({ 'Content-Type': fileReal.type });

      // PUT trực tiếp lên link AWS S3 gốc
      await firstValueFrom(
        this.pureHttp.put(s3Info.uploadUrl, fileReal, { headers })
      );
      console.log(`✔ Đã đẩy xong file thật lên S3: ${fileReal.name}`);
    }

    // 3. Trả về danh sách chứa các objectKey để thằng cha đem đi gọi hàm COMMIT tin nhắn
    return presignedList;
  }
  getFileIcon(fileType: string): string {
    if (!fileType) return 'description';
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('msword') || fileType.includes('officedocument.wordprocessingml')) return 'description'; // Word
    if (fileType.includes('ms-excel') || fileType.includes('officedocument.spreadsheetml')) return 'table_chart'; // Excel
    if (fileType.includes('zip') || fileType.includes('rar')) return 'folder_zip';
    return 'description'; // File mặc định
  }
  getCleanFileName(fileUrl: string): string {
    if (!fileUrl) return 'Tệp đính kèm';
    const parts = fileUrl.split('/');
    const rawFileName = parts[parts.length - 1]; // Lấy cụm cuối cùng: "171791234_abc888_huong-dan.pdf"
    
    // Tìm vị trí dấu gạch dưới thứ 2 để lấy tên gốc của User (nếu ông đặt tên file theo format trước)
    // Nếu lằng nhằng quá thì chỉ cần cắt lấy đoạn sau timestamp + uuid là được.
    // Cách đơn giản nhất là lấy 20 ký tự cuối hoặc split:
    const subParts = rawFileName.split('_');
    if (subParts.length > 2) {
      return subParts.slice(2).join('_'); // Trả về: "huong-dan.pdf"
    }
    return rawFileName;
  }
}