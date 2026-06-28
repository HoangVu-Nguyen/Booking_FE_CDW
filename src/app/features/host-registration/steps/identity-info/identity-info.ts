import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KycService } from '../../../../core/services/kyc/kyc.service';


@Component({
  selector: 'app-identity-info',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './identity-info.html',
  styleUrls: ['./identity-info.css']
})
export class IdentityInfo implements OnInit {
  kycForm!: FormGroup;
  isSubmitting = false;
  rejectionReason : string | null = null;
  status : string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private kycService: KycService
  ) { }

  ngOnInit(): void {
    // 1. Khởi tạo form trống trước
    this.kycForm = this.fb.group({
        legalName: ['', [Validators.required, Validators.minLength(3)]],
        idCardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,12}$')]],
        idCardIssuedBy: ['', [Validators.required]],
        bankName: ['', [Validators.required]],
        bankAccountNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        bankAccountOwner: ['', [Validators.required]]
    });

    // 2. Gọi API lấy dữ liệu cũ
    this.kycService.getMyProfile().subscribe({
        next: (res) => {
            if (res && res.data) {
              console.log(res.data)
                this.kycForm.patchValue(res.data);
                
                if (res.data.status === 'PENDING' || res.data.status === 'APPROVED') {
                    this.kycForm.disable();
                }
                this.rejectionReason = res.data.rejectionReason
                this.status = res.data.status
            }
        },
        error: (err) => {
            console.log("User chưa có hồ sơ, tiếp tục tạo mới.");
        }
    });
}

  // Hàm tiện ích để auto-copy tên từ CCCD xuống Tên chủ tài khoản ngân hàng
  syncName(): void {
    const name = this.kycForm.get('legalName')?.value;
    if (name) {
      this.kycForm.patchValue({
        bankAccountOwner: name.toUpperCase() // Tên ngân hàng thường viết hoa
      });
    }
  }

  onSubmit(): void {
    console.log("ajhsdjkahdas")
    if (this.kycForm.invalid) {
      this.kycForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.kycForm.value;

    console.log('Dữ liệu gửi đi:', formData);


    this.kycService.createProfile(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.kycService.setProfileId(res.data);
          this.router.navigate(['/register-host/upload']);
        }

      },
      error: (err) => { this.isSubmitting = false; }
    });    
  }
}