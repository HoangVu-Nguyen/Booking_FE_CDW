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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private kycService: KycService
  ) { }

  ngOnInit(): void {
    this.kycForm = this.fb.group({
      // Khối 1: CCCD
      legalName: ['', [Validators.required, Validators.minLength(3)]],
      idCardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,12}$')]],
      idCardIssuedBy: ['', [Validators.required]],

      // Khối 2: Ngân hàng
      bankName: ['', [Validators.required]],
      bankAccountNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      bankAccountOwner: ['', [Validators.required]]
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