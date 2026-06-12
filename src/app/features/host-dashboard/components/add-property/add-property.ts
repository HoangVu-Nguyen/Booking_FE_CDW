import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import * as L from 'leaflet';
import { HomestayService } from '../../../../core/services/homestay/homestay.service';
import { ImageType } from '../../../../core/enum/image-type.enum';

type PropertyType = 'APARTMENT' | 'VILLA' | 'HOUSE';

interface PropertyTypeOption {
  value: PropertyType;
  label: string;
  icon: string;
  description: string;
}

interface ImagePreview {
  id: string;
  file: File;
  name: string;
  url: string;
}

interface NominatimSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  // BƯỚC 1: Thêm object address để hứng dữ liệu chi tiết từ OpenStreetMap
  address?: {
    city?: string;
    state?: string;
    province?: string;
    town?: string;
    county?: string;
  };
}

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-property.html'
})
export class AddProperty implements AfterViewInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  isProcessing = signal(false);
  private homestayService = inject(HomestayService);

  private map?: L.Map;
  private marker?: L.Marker;
  private addressSearchTimer?: ReturnType<typeof setTimeout>;

  private defaultCenter: L.LatLngExpression = [10.776889, 106.700806];

  addressSuggestions: NominatimSuggestion[] = [];

  propertyTypes: PropertyTypeOption[] = [
    {
      value: 'APARTMENT',
      label: 'Căn hộ',
      icon: 'apartment',
      description: 'Căn hộ chung cư, studio hoặc căn hộ dịch vụ.'
    },
    {
      value: 'VILLA',
      label: 'Biệt thự',
      icon: 'villa',
      description: 'Không gian riêng tư, phù hợp nhóm hoặc gia đình.'
    },
    {
      value: 'HOUSE',
      label: 'Nhà nguyên căn',
      icon: 'home',
      description: 'Toàn bộ căn nhà dành riêng cho khách lưu trú.'
    }
  ];

  nameSuggestions: string[] = [
    'The Green Nest',
    'Dalat Mist House',
    'Moonlight Villa',
    'Clyva Stay'
  ];

  draftForm = {
    type: 'APARTMENT' as PropertyType,
    name: '',
    address: '',
    city: '', // BƯỚC 2: Khai báo biến hứng Tỉnh/Thành phố
    lat: null as number | null,
    lng: null as number | null,
    images: [] as File[]
  };

  imagePreviews: ImagePreview[] = [];

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.imagePreviews.forEach(item => URL.revokeObjectURL(item.url));

    if (this.addressSearchTimer) {
      clearTimeout(this.addressSearchTimer);
    }

    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.defaultCenter,
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', event => {
      this.zone.run(() => {
        this.setPinnedLocation(event.latlng.lat, event.latlng.lng, true);
      });
    });

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  onAddressInput(): void {
    const query = this.draftForm.address.trim();

    if (this.addressSearchTimer) {
      clearTimeout(this.addressSearchTimer);
    }

    if (query.length < 3) {
      this.addressSuggestions = [];
      return;
    }

    this.addressSearchTimer = setTimeout(() => {
      this.searchAddress(query);
    }, 500);
  }

  private async searchAddress(query: string): Promise<void> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'vn'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tìm địa chỉ.');
      }

      const data = await response.json() as NominatimSuggestion[];

      this.zone.run(() => {
        this.addressSuggestions = data;
      });
    } catch (error) {
      console.error('Lỗi tìm địa chỉ:', error);
      this.zone.run(() => {
        this.addressSuggestions = [];
      });
    }
  }

 selectAddressSuggestion(suggestion: NominatimSuggestion): void {
    const lat = Number(suggestion.lat);
    const lng = Number(suggestion.lon);

    this.draftForm.address = suggestion.display_name;

    // NHỊP 1: Thử bóc theo object address của Nominatim trước
    let detectedCity = '';
    if (suggestion.address) {
      detectedCity = suggestion.address.city || 
                     suggestion.address.state || 
                     suggestion.address.province || 
                     suggestion.address.town || 
                     '';
    }

    // NHỊP 2: NẾU VẪN RỖNG (Do Nominatim trả về cấu trúc thiếu ở một số tỉnh như Bình Dương)
    // Tự động chuyển sang thuật toán cào chuỗi ngược từ display_name - ĐẢM BẢO KHÔNG BỊ TRỐNG
    if (!detectedCity && suggestion.display_name) {
      detectedCity = this.extractCityFromDisplayName(suggestion.display_name);
    }

    // Gán kết quả cuối cùng vào form
    this.draftForm.city = detectedCity;
    console.log('👉 Tên Thành phố/Tỉnh chốt hạ gửi lên BE:', this.draftForm.city);

    this.addressSuggestions = [];
    this.setPinnedLocation(lat, lng, true);
  }

  /**
   * Thuật toán bổ trợ: Cào chuỗi địa chỉ từ phải qua trái để lấy Tỉnh/Thành phố
   */
  private extractCityFromDisplayName(displayName: string): string {
    // Cắt chuỗi theo dấu phẩy và xóa khoảng trắng thừa
    const parts = displayName.split(',').map(p => p.trim());
    
    // 1. Loại bỏ phần tử cuối cùng nếu là Quốc gia ("Vietnam" hoặc "Việt Nam")
    if (parts.length > 0 && (parts[parts.length - 1].toLowerCase() === 'vietnam' || parts[parts.length - 1].toLowerCase() === 'việt nam')) {
      parts.pop();
    }
    
    if (parts.length === 0) return '';
    
    // 2. Loại bỏ mã bưu chính nếu có (Ví dụ: "64000", "70000" - nhận diện nếu chuỗi chỉ toàn là số)
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      parts.pop();
    }
    
    // 3. Thằng cuối cùng còn sót lại ở đuôi lúc này chắn chắn là Tỉnh / Thành phố
    return parts.length > 0 ? parts[parts.length - 1] : '';
  }

  private setPinnedLocation(lat: number, lng: number, shouldZoom: boolean): void {
    this.draftForm.lat = Number(lat.toFixed(6));
    this.draftForm.lng = Number(lng.toFixed(6));

    if (!this.map) return;

    const position: L.LatLngExpression = [this.draftForm.lat, this.draftForm.lng];

    if (!this.marker) {
      this.marker = L.marker(position, {
        draggable: true
      }).addTo(this.map);

      this.marker.on('dragend', () => {
        const markerPosition = this.marker?.getLatLng();

        if (!markerPosition) return;

        this.zone.run(() => {
          this.draftForm.lat = Number(markerPosition.lat.toFixed(6));
          this.draftForm.lng = Number(markerPosition.lng.toFixed(6));
        });
      });
    } else {
      this.marker.setLatLng(position);
    }

    if (shouldZoom) {
      this.map.setView(position, 16);
    } else {
      this.map.panTo(position);
    }
  }

  getPropertyLabel(): string {
    return this.propertyTypes.find(item => item.value === this.draftForm.type)?.label || 'Căn hộ';
  }

  hasPinnedLocation(): boolean {
    return this.draftForm.lat !== null && this.draftForm.lng !== null;
  }

  completionPercent(): number {
    let completed = 0;

    if (this.draftForm.type) completed += 1;
    if (this.draftForm.name.trim()) completed += 1;
    if (this.draftForm.address.trim()) completed += 1;
    if (this.hasPinnedLocation()) completed += 1;
    if (this.draftForm.images.length > 0) completed += 1;

    return Math.round((completed / 5) * 100);
  }

  pinCurrentLocation(): void {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('Latitude:', position.coords.latitude);
        console.log('Longitude:', position.coords.longitude);
        console.log('Accuracy meters:', position.coords.accuracy);

        this.zone.run(() => {
          this.setPinnedLocation(
            position.coords.latitude,
            position.coords.longitude,
            true
          );
        });
      },
      error => {
        console.error('Không thể lấy vị trí hiện tại:', error);
        alert('Không thể lấy vị trí hiện tại. Hãy nhập địa chỉ hoặc bấm trực tiếp trên bản đồ.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const selectedFiles = Array.from(input.files);

    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;

      return isImage && isUnder10MB;
    });

    const newPreviews: ImagePreview[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    this.imagePreviews = [...this.imagePreviews, ...newPreviews];
    this.draftForm.images = this.imagePreviews.map(item => item.file);

    input.value = '';
  }

  removeImage(id: string): void {
    const removedImage = this.imagePreviews.find(item => item.id === id);

    if (removedImage) {
      URL.revokeObjectURL(removedImage.url);
    }

    this.imagePreviews = this.imagePreviews.filter(item => item.id !== id);
    this.draftForm.images = this.imagePreviews.map(item => item.file);
  }

  async createDraft(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.validateForm()) return; 

    this.isProcessing.set(true);

    try {
      let uploadedObjectKeys: string[] = [];

      // ==========================================
      // NHỊP 1 & 2: XIN URL VÀ UPLOAD LÊN S3
      // ==========================================
      if (this.draftForm.images.length > 0) {
        const batchRequest = {
          items: this.draftForm.images.map(file => ({
            fileName: file.name,
            contentType: file.type,
            imageType: ImageType.HOMESTAY,
            fileSize: file.size
          }))
        };

        const presignedResponse = await this.homestayService.getPresignedUrls(batchRequest).toPromise();
        
        if (!presignedResponse || !presignedResponse.data) {
          throw new Error('Không lấy được URL cấp phép từ Server.');
        }

        const uploadUrls = presignedResponse.data;

        const uploadPromises = this.draftForm.images.map((file, index) => {
          const s3Info = uploadUrls[index];
          return fetch(s3Info.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          }).then(res => {
            if (!res.ok) throw new Error('Upload S3 thất bại: ' + file.name);
            return s3Info.objectKey; 
          });
        });

        uploadedObjectKeys = await Promise.all(uploadPromises);
        console.log('Đã upload S3 thành công các keys:', uploadedObjectKeys);
      }

      // ==========================================
      // NHỊP 3: TẠO HOMESTAY DRAFT (JSON)
      // ==========================================
      let mapCategoryId = 1; 
      if (this.draftForm.type === 'VILLA') mapCategoryId = 2;
      else if (this.draftForm.type === 'HOUSE') mapCategoryId = 3;
      
      const payload = {
        name: this.draftForm.name.trim(),
        categoryId: mapCategoryId,
        addressDetail: this.draftForm.address.trim(),
        city: this.draftForm.city, // BƯỚC 4: NHÉT CÁI CITY ĐÃ BÓC ĐƯỢC VÀO ĐÂY!
        latitude: this.draftForm.lat,
        longitude: this.draftForm.lng,
        objectKeys: uploadedObjectKeys
      };
      console.log('Payload chuẩn bị gửi xuống BE:', payload);

      const finalRes = await this.homestayService.createDraftHomestay(payload).toPromise();
      
      console.log('Tạo Draft thành công!', finalRes);
      this.close.emit(); // Thành công thì đóng popup

    } catch (error) {
      console.error('Lỗi quy trình tạo Draft:', error);
      alert('Có lỗi xảy ra trong quá trình upload ảnh hoặc tạo dữ liệu.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  private validateForm(): boolean {
    if (!this.draftForm.name.trim()) {
      alert('Vui lòng nhập tên chỗ nghỉ.');
      return false;
    }

    if (!this.draftForm.address.trim()) {
      alert('Vui lòng nhập địa chỉ chỗ nghỉ.');
      return false;
    }

    if (!this.hasPinnedLocation()) {
      alert('Vui lòng ghim vị trí chỗ nghỉ trên bản đồ.');
      return false;
    }

    if (this.draftForm.images.length === 0) {
      alert('Vui lòng tải lên ít nhất 1 hình ảnh tổng quan.');
      return false;
    }

    return true;
  }
}