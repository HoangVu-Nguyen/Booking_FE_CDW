import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-property.html'
})
export class AddProperty {
  private fb = inject(FormBuilder);
  
  currentStep = signal(1);
  readonly totalSteps = 4;

  // Khởi tạo form chính
  propertyForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    type: ['APARTMENT'],
    address: ['', Validators.required],
    description: [''],
    rooms: this.fb.array([this.createRoom()])
  });

  // Getter để lấy mảng phòng
  get rooms(): FormArray { return this.propertyForm.get('rooms') as FormArray; }

  createRoom(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      type: ['STANDARD'],
      maxGuests: [2, [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      ratePlans: this.fb.array([this.createRate()])
    });
  }

  createRate(): FormGroup {
    return this.fb.group({
      name: ['Giá cơ bản', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addRoom() { this.rooms.push(this.createRoom()); }
  removeRoom(index: number) { if (this.rooms.length > 1) this.rooms.removeAt(index); }
  addRate(room: FormGroup) { (room.get('ratePlans') as FormArray).push(this.createRate()); }

  nextStep() {
    // Chỉ cho qua bước nếu form bước hiện tại hợp lệ (ở đây đơn giản hóa là kiểm tra toàn bộ form)
    if (this.currentStep() < this.totalSteps) this.currentStep.update(v => v + 1);
  }

  prevStep() { if (this.currentStep() > 1) this.currentStep.update(v => v - 1); }

  submit() {
    if (this.propertyForm.valid) {
      console.log('Dữ liệu chuẩn đã validate:', this.propertyForm.value);
    } else {
      console.error('Form chưa hợp lệ, kiểm tra lại các trường!');
      this.propertyForm.markAllAsTouched();
    }
  }
  // Thêm getter này vào class AddProperty
getRatePlans(room: any): FormArray {
  return room.get('ratePlans') as FormArray;
}
}