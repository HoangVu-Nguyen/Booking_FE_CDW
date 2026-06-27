import { Component, OnInit, inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-homestay-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homestay-verification.html'
})
export class HomestayVerification implements OnInit {
  // Thực tế ông nên lấy từ Route params: this.route.snapshot.paramMap.get('id')
 homestayId: string | null = null;
  // Form State
  selectedDocType: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isPdf: boolean = false;
  isUploading: boolean = false;
  private route = inject(ActivatedRoute);
  private changeRef = inject(ChangeDetectorRef);

  // Data từ server
  uploadedDocs: any[] = [];

  // Inject service (Cách mới của Angular)
  private homestayService = inject(HomestayService);

  constructor() {}

 
  
    ngOnInit(): void {
    const paramMap$ = this.route.parent?.paramMap ?? this.route.paramMap;

    paramMap$.subscribe(params => {
      this.homestayId = params.get('id') || params.get('homestayId');

      if (this.homestayId) {
      this.loadExistingDocuments();
      }
    });
  }

  // 1. LẤY DANH SÁCH GIẤY TỜ TỪ DB
  loadExistingDocuments() {
    this.homestayService.getHomestayDocuments(this.homestayId!).subscribe({
      next: (response) => {
        if (response.success) {
          this.uploadedDocs = response.data;
          this.changeRef.detectChanges()
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách tài liệu:', error);
      }
    });
  }

  // Xử lý khi chọn file (Giữ nguyên của ông)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.isPdf = file.type === 'application/pdf';

    if (!this.isPdf) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
          this.changeRef.detectChanges()
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = 'pdf-icon'; 
    }
  }

  // Xóa file đang chọn tạm
  clearSelection() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.isPdf = false;
  }

  // 2. LUỒNG UPLOAD 3 BƯỚC THỰC TẾ
  async onUploadDocument() {
    if (!this.selectedFile || !this.selectedDocType) return;
    this.isUploading = true;

    try {
      // Bước 1: Gọi API Prepare lấy URL S3 và thông tin file
      const batchRequest = {
        items: [
          {
            documentType: this.selectedDocType,
            fileName: this.selectedFile.name,
            contentType: this.selectedFile.type,
            fileSize: this.selectedFile.size
          }
        ]
      };

      const prepareRes = await lastValueFrom(this.homestayService.prepareDocumentUploads(this.homestayId!, batchRequest));
      
      if (!prepareRes.success || !prepareRes.data || prepareRes.data.length === 0) {
        throw new Error('Không thể khởi tạo phiên tải lên.');
      }

      // Lấy data của file đầu tiên (vì mình chỉ up 1 file mỗi lần)
      const uploadData = prepareRes.data[0];
      console.log(uploadData)

      // Bước 2: Upload trực tiếp lên S3 bằng uploadUrl
      await lastValueFrom(this.homestayService.uploadFileToS3(uploadData.uploadUrl, this.selectedFile));

      await lastValueFrom(this.homestayService.confirmDocumentUpload(this.homestayId!, uploadData.documentId));

      alert('Tải lên thành công!'); 
      this.clearSelection();
      this.selectedDocType = '';
      this.loadExistingDocuments(); // Gọi lại hàm để cập nhật danh sách UI

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Có lỗi xảy ra khi tải lên. Vui lòng thử lại!');
    } finally {
      this.isUploading = false;
    }
  }

  async submitForReview() {
    if (this.uploadedDocs.length === 0) {
      alert('Vui lòng tải lên ít nhất 1 tài liệu trước khi gửi duyệt!');
      return;
    }

    try {
      const res = await lastValueFrom(this.homestayService.submitForVerification(this.homestayId!));
      if (res.success) {
        alert('Đã gửi hồ sơ thành công! Vui lòng chờ Admin kiểm duyệt.');
      }
    } catch (error) {
      alert('Gửi duyệt thất bại. Vui lòng kiểm tra lại!');
    }
  }

  // Helper
  getDocTypeName(type: string): string {
    const types: any = {
      'OWNERSHIP_CERTIFICATE': 'Giấy tờ sở hữu (Sổ đỏ/hồng)',
      'LEASE_AGREEMENT': 'Hợp đồng thuê nhà',
      'BUSINESS_LICENSE': 'Giấy phép kinh doanh'
    };
    return types[type] || type;
  }

  getStatusName(status: string): string {
    const statuses: any = {
      'PENDING': 'Đang chờ duyệt',
      'APPROVED': 'Đã chấp nhận',
      'REJECTED': 'Bị từ chối'
    };
    return statuses[status] || status;
  }
  openDocument(url: string | undefined) {
    if (url) {
      // Mở URL sang một tab mới. Trình duyệt sẽ tự động render Ảnh hoặc PDF
      window.open(url, '_blank');
    } else {
      alert('Không tìm thấy đường dẫn tệp hoặc tệp đã hết hạn xem. Vui lòng tải lại trang!');
    }
  }
}