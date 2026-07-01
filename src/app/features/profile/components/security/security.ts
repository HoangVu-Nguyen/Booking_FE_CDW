import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { UserService } from '../../../../core/services/user/user.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './security.html',
})
export class Security {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private userService = inject(UserService);

  passwordForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  get passwordStrength(): number {
    const pwd = this.passwordForm.get('newPassword')?.value || '';
    if (pwd.length === 0) return 0;
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  }

  getStrengthLabel(): string {
    const s = this.passwordStrength;
    if (s === 0) return '';
    if (s === 1) return 'Yếu';
    if (s === 2) return 'Khá';
    return 'Mạnh';
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    
    const payload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Thành công', 'Đổi mật khẩu thành công!');
        this.passwordForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        const msg = err.error?.message || 'Có lỗi xảy ra khi đổi mật khẩu.';
        this.toastService.error('Thất bại', msg);
      }
    });
  }
}
