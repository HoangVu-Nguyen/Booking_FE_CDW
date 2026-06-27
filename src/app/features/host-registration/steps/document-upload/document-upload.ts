import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KycService } from '../../../../core/services/kyc/kyc.service';
import { KycDocumentType } from '../../../../core/enum/kyc-document-type.enum';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-document-upload',
  imports:[CommonModule],
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


  constructor(private kycService: KycService, private router: Router,private http: HttpClient) {}

  ngOnInit() {
    this.profileId = this.kycService.getProfileId();
    if (!this.profileId) {
      this.router.navigate(['/register-host/info']); // Bảo vệ route
    }
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