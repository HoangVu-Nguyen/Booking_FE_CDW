import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { KycService } from '../../../../core/services/kyc/kyc.service';
import { KycDocumentType } from '../../../../core/enum/kyc-document-type.enum';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-document-upload',
  imports: [CommonModule],
  templateUrl: './document-upload.html'
})
export class DocumentUpload implements OnInit {
  selectedFiles: File[] = [];
  isUploading = false;
  profileId: number | null = null;
  frontFile: File | null = null;
  backFile: File | null = null;
  frontPreview: string | null = null;
  backPreview: string | null = null;
  rejectionReason:string | null = null;


  constructor(private kycService: KycService, private router: Router, private http: HttpClient,private changeRef:ChangeDetectorRef) { }

  ngOnInit() {
  this.kycService.getMyProfileId().subscribe({
    next: (res) => {
      if (res.data) {
        this.profileId = res.data;
        this.kycService.setProfileId(this.profileId!);
        
        // Gọi hàm load ảnh tại đây
        this.loadImages(this.profileId!);
        this.changeRef.detectChanges();
      } else {
        this.router.navigate(['/register-host/info']);
      }
    },
    error: () => this.router.navigate(['/register-host/info'])
  });
}

loadImages(profileId: number) {
  this.kycService.getKycImagesForProfile(profileId).subscribe({
    next: (res) => {
      console.log("Dữ liệu ảnh từ server:", res); // DEBUG: Xem chính xác cấu trúc trả về
      
      if (res.success && res.data?.images) {
        res.data.images.forEach((img: any) => {
          // BẮT BUỘC: Kiểm tra lại xem img.documentType trả về là gì (Console log ở trên sẽ chỉ rõ)
          // Ví dụ nếu backend trả về Enum String, có thể là 'ID_FRONT' hoặc 'ID_FRONT_CCCD'
          if (img.documentType === 'ID_FRONT') {
            this.frontPreview = img.url;
          } else if (img.documentType === 'ID_BACK') {
            this.backPreview = img.url;
          }
        });
        this.changeRef.detectChanges();
      }
    },
    error: (err) => console.error("Không tải được ảnh cũ:", err)
  });
}



  loadExistingDocuments() {
    // Giả sử ông đã thêm hàm getKycImagesForProfile vào KycService
    this.kycService.getKycImagesForProfile(this.profileId!).subscribe({
      next: (res) => {
        if (res && res.data && res.data.images) {
          // Map lại từ objectKey hoặc type để gán preview
          res.data.images.forEach((img: any) => {
            // Logic này phụ thuộc vào cách ông lưu 'type' trong Document entity
            // Nếu ông lưu objectKey chứa 'FRONT' hoặc 'BACK' thì check như sau:
            if (img.documentType.includes('FRONT')) {
              this.frontPreview = img.url;
            } else if (img.documentType.includes('BACK')) {
              this.backPreview = img.url;
            }
          });
        }
      },
      error: (err) => console.log("Chưa có ảnh cũ hoặc lỗi:", err)
    });
  }

  onFileSelected(event: any, type: 'FRONT' | 'BACK') {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'FRONT') {
      this.frontFile = file;
      this.frontPreview = URL.createObjectURL(file);
    } else {
      this.backFile = file;
      this.backPreview = URL.createObjectURL(file);
    }
  }

  async onUpload() {
    if (!this.frontFile || !this.backFile || !this.profileId) return;

    this.isUploading = true;
    const files = [this.frontFile, this.backFile];
    const types = [KycDocumentType.ID_FRONT, KycDocumentType.ID_BACK];

    try {
      const batchRequest = {
        profileId: this.profileId,
        items: files.map((file, i) => ({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          documentType: types[i]
        }))
      };

      const preUploadRes = await this.kycService.preUpload(batchRequest).toPromise();
      if (!preUploadRes?.success) throw new Error("Lỗi gọi API Pre-upload");
      const uploadData = preUploadRes.data;

      // Upload song song lên S3
      const uploadTasks = uploadData.map((item, i) =>
        this.http.put(item.uploadUrl, files[i], { headers: { 'Content-Type': files[i].type } }).toPromise()
      );
      await Promise.all(uploadTasks);

      // Confirm với Backend
      await this.kycService.confirmUpload(uploadData.map(d => d.documentId)).toPromise();

      alert('Hồ sơ đã được gửi đi thẩm định!');
      this.router.navigate(['/dashboard']);
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      this.isUploading = false;
    }
  }
}