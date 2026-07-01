import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TourService } from '../../../../../../core/services/tour/tour.service';
import { TourResponse } from '../../../../../../core/models/response/tour.response';

@Component({
  selector: 'app-property-tours',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './property-tours.html'
})
export class PropertyTours implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);

  homestayId = signal<number | null>(null);
  tours = signal<TourResponse[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

  viewMode = signal<'LIST' | 'FORM'>('LIST');
  editingTourId = signal<number | null>(null);

  tourForm: FormGroup;
  primaryImagePreview = signal<string | null>(null);
  hoverImagePreview = signal<string | null>(null);

  primaryImageFile: File | null = null;
  hoverImageFile: File | null = null;

  durationTypes = [
    { value: 'HOURS', label: 'Giờ' },
    { value: 'HALF_DAY', label: 'Nửa ngày' },
    { value: 'FULL_DAY', label: 'Cả ngày' },
    { value: 'DAYS', label: 'Ngày' }
  ];

  constructor() {
    this.tourForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      durationType: ['HOURS', [Validators.required]],
      durationValue: [1, [Validators.required, Validators.min(1)]],
      pricePerPerson: [0, [Validators.required, Validators.min(0)]],
      maxParticipants: [10, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Inject từ Route cha (ManageProperty)
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.homestayId.set(Number(id));
        this.loadTours();
      }
    });
  }

  loadTours() {
    const id = this.homestayId();
    if (!id) return;

    this.isLoading.set(true);
    this.tourService.getToursByHomestayId(id).subscribe({
      next: (res) => {
        console.log(res)
        if (res.success && res.data) {
          this.tours.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleViewMode(mode: 'LIST' | 'FORM', tour?: TourResponse) {
    this.viewMode.set(mode);
    if (mode === 'FORM') {
      if (tour) {
        this.editingTourId.set(tour.id);
        this.tourForm.patchValue({
          name: tour.name,
          description: tour.description,
          durationType: tour.durationType,
          durationValue: tour.durationValue,
          pricePerPerson: tour.pricePerPerson,
          maxParticipants: tour.maxParticipants
        });
        this.primaryImagePreview.set(tour.primaryImageUrl || null);
        this.hoverImagePreview.set(tour.hoverImageUrl || null);
      } else {
        this.editingTourId.set(null);
        this.tourForm.reset({
          durationType: 'HOURS',
          durationValue: 1,
          pricePerPerson: 0,
          maxParticipants: 10
        });
        this.primaryImagePreview.set(null);
        this.hoverImagePreview.set(null);
      }
      this.primaryImageFile = null;
      this.hoverImageFile = null;
    }
  }

  deleteTour(tourId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa tour này không?')) {
      this.tourService.deleteTour(tourId).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadTours();
          }
        },
        error: (err) => console.error('Lỗi khi xóa tour:', err)
      });
    }
  }

  onFileSelected(event: any, type: 'PRIMARY' | 'HOVER') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'PRIMARY') {
          this.primaryImagePreview.set(e.target.result);
          this.primaryImageFile = file;
        } else {
          this.hoverImagePreview.set(e.target.result);
          this.hoverImageFile = file;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.tourForm.invalid) {
      this.tourForm.markAllAsTouched();
      return;
    }

    const id = this.homestayId();
    if (!id) return;

    this.isSubmitting.set(true);

    try {
      let primaryKey = null;
      let hoverKey = null;

      // Chuẩn bị danh sách file cần upload
      const filesToUpload = [];
      const fileMetadatas = [];

      if (this.primaryImageFile) {
        filesToUpload.push(this.primaryImageFile);
        fileMetadatas.push({
          fileName: this.primaryImageFile.name,
          contentType: this.primaryImageFile.type,
          imageType: 'TOUR_PRIMARY',
          fileSize: this.primaryImageFile.size
        });
      }

      if (this.hoverImageFile) {
        filesToUpload.push(this.hoverImageFile);
        fileMetadatas.push({
          fileName: this.hoverImageFile.name,
          contentType: this.hoverImageFile.type,
          imageType: 'TOUR_HOVER',
          fileSize: this.hoverImageFile.size
        });
      }

      // Nếu có file, gọi API chuẩn bị upload S3
      if (filesToUpload.length > 0) {
        const prepareRes = await firstValueFrom(this.tourService.prepareTourImageUploads(fileMetadatas));
        const presignedUrls = prepareRes.data;

        // Upload trực tiếp lên S3 (chạy song song)
        const uploadPromises = filesToUpload.map((file, index) =>
          firstValueFrom(this.tourService.uploadToS3(presignedUrls[index].uploadUrl, file))
        );

        await Promise.all(uploadPromises);

        // Gán lại key sau khi upload thành công
        if (this.primaryImageFile) {
          primaryKey = presignedUrls[0].objectKey;
          if (this.hoverImageFile) hoverKey = presignedUrls[1].objectKey;
        } else {
          if (this.hoverImageFile) hoverKey = presignedUrls[0].objectKey;
        }
      }

      // Nếu không có file mới up lên thì lấy lại url cũ
      if (!this.primaryImageFile) primaryKey = this.primaryImagePreview();
      if (!this.hoverImageFile) hoverKey = this.hoverImagePreview();

      // Lấy các key khác null
      const imageKeys = [primaryKey, hoverKey].filter(k => k != null);

      // Tạo Tour Request
      const requestData = {
        ...this.tourForm.value,
        imageKeys: imageKeys
      };

      let res;
      if (this.editingTourId()) {
        res = await firstValueFrom(this.tourService.updateTour(this.editingTourId()!, requestData));
      } else {
        res = await firstValueFrom(this.tourService.createTour(id, requestData));
      }

      if (res.success) {
        this.loadTours();
        this.toggleViewMode('LIST');
      }
    } catch (err) {
      console.error('Lỗi khi tạo tour:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
