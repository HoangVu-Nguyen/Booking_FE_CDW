import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../../../../core/services/toast/toast.service';
import { ChangeDetectorRef } from '@angular/core';
interface NominatimSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    state?: string;
    province?: string;
    town?: string;
    county?: string;
  };
}

@Component({
  selector: 'app-property-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-info.html'
})
export class PropertyInfo implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private homestayService = inject(HomestayService);
private cdr = inject(ChangeDetectorRef);
  homestayId: string | null = null;

  isSaving = signal(false);
  isDirty = signal(false);
  showSavedToast = signal(false);
  isLoading = signal(false);
  private toastService = inject(ToastService);

  infoForm = {
    type: 'APARTMENT',
    name: '',
    description: '',
    addressDetail: '',
    city: '',
    lat: null as number | null,
    lng: null as number | null
  };

  propertyTypes = [
    { value: 'APARTMENT', label: 'Căn hộ' },
    { value: 'VILLA', label: 'Biệt thự' },
    { value: 'HOUSE', label: 'Nhà nguyên căn' }
  ];

  addressSuggestions: NominatimSuggestion[] = [];

  private map?: L.Map;
  private marker?: L.Marker;
  private addressSearchTimer?: ReturnType<typeof setTimeout>;
  private mapReady = false;
  private pendingLocation: { lat: number; lng: number } | null = null;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.homestayId = params.get('id');

      if (this.homestayId) {
        this.loadHomestayData(this.homestayId);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.addressSearchTimer) {
      clearTimeout(this.addressSearchTimer);
    }

    if (this.map) {
      this.map.remove();
    }
  }

  private loadHomestayData(id: string): void {
    this.isLoading.set(true);

    this.homestayService.getHomestayById(Number(id)).subscribe({
      next: res => {
        this.zone.run(() => {
          this.isLoading.set(false);

          if (!res.success || !res.data) {
            return;
          }

          const data = res.data;

          let mapType: 'APARTMENT' | 'VILLA' | 'HOUSE' = 'APARTMENT';

          if (data.categoryId === 2) {
            mapType = 'VILLA';
          } else if (data.categoryId === 3) {
            mapType = 'HOUSE';
          }

          this.infoForm = {
            type: mapType,
            name: data.name || '',
            description: data.description || '',
            addressDetail: data.addressDetail || '',
            city: data.cityName || '',
            lat: data.latitude ?? null,
            lng: data.longitude ?? null
          };

          this.isDirty.set(false);

          // Cập nhật lại bản đồ
          if (this.infoForm.lat !== null && this.infoForm.lng !== null) {
            this.applyLoadedLocation(this.infoForm.lat, this.infoForm.lng);
          }
        });
        this.cdr.detectChanges();
      },
      error: err => {
        // 👉 Ở NHỊP ERROR CŨNG PHẢI ĐƯA VÀO ZONE
        this.zone.run(() => {
          this.isLoading.set(false);
          console.error('Lỗi khi tải thông tin chỗ nghỉ:', err);
          alert('Không thể tải dữ liệu chỗ nghỉ. Vui lòng thử lại.');
        });
      }
    });
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    const center: L.LatLngExpression = [
      this.infoForm.lat ?? 10.776889,
      this.infoForm.lng ?? 106.700806
    ];

    this.map = L.map(this.mapContainer.nativeElement, {
      center,
      zoom: 15,
      zoomControl: true
    });

    this.mapReady = true;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', event => {
      this.zone.run(() => {
        this.setPinnedLocation(event.latlng.lat, event.latlng.lng, true, true);
      });
    });

    if (this.infoForm.lat !== null && this.infoForm.lng !== null) {
      this.setPinnedLocation(this.infoForm.lat, this.infoForm.lng, false, false);
    }

    if (this.pendingLocation) {
      this.setPinnedLocation(
        this.pendingLocation.lat,
        this.pendingLocation.lng,
        true,
        false
      );
      this.pendingLocation = null;
    }

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 250);
  }

  private applyLoadedLocation(lat: number, lng: number): void {
    if (!this.mapReady || !this.map) {
      this.pendingLocation = { lat, lng };
      return;
    }

    this.setPinnedLocation(lat, lng, true, false);
  }

  onAddressInput(): void {
    this.markDirty();

    const query = this.infoForm.addressDetail.trim();

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

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Không thể tìm địa chỉ.');
      }

      const data = (await response.json()) as NominatimSuggestion[];

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

    this.infoForm.addressDetail = suggestion.display_name;
    this.infoForm.city = this.extractCityFromSuggestion(suggestion);
    this.addressSuggestions = [];

    this.setPinnedLocation(lat, lng, true, true);
    this.markDirty();
  }

  private extractCityFromSuggestion(suggestion: NominatimSuggestion): string {
    if (suggestion.address) {
      const detectedCity =
        suggestion.address.city ||
        suggestion.address.state ||
        suggestion.address.province ||
        suggestion.address.town ||
        suggestion.address.county ||
        '';

      if (detectedCity) {
        return detectedCity;
      }
    }

    if (!suggestion.display_name) {
      return '';
    }

    const parts = suggestion.display_name
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      return '';
    }

    const lastPart = parts[parts.length - 1]?.toLowerCase();

    if (lastPart === 'vietnam' || lastPart === 'việt nam') {
      parts.pop();
    }

    const last = parts[parts.length - 1];

    if (last && /^\d+$/.test(last)) {
      parts.pop();
    }

    return parts.length > 0 ? parts[parts.length - 1] : '';
  }

  private setPinnedLocation(
    lat: number,
    lng: number,
    shouldZoom: boolean,
    shouldMarkDirty = true
  ): void {
    this.infoForm.lat = Number(lat.toFixed(6));
    this.infoForm.lng = Number(lng.toFixed(6));

    if (shouldMarkDirty) {
      this.markDirty();
    }

    if (!this.map) return;

    const position: L.LatLngExpression = [
      this.infoForm.lat,
      this.infoForm.lng
    ];

    if (!this.marker) {
      this.marker = L.marker(position, {
        draggable: true
      }).addTo(this.map);

      this.marker.on('dragend', () => {
        const markerPosition = this.marker?.getLatLng();

        if (!markerPosition) return;

        this.zone.run(() => {
          this.infoForm.lat = Number(markerPosition.lat.toFixed(6));
          this.infoForm.lng = Number(markerPosition.lng.toFixed(6));
          this.markDirty();
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

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  pinCurrentLocation(): void {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log('Current location:', {
          lat,
          lng,
          accuracy
        });

        if (accuracy > 3000) {
          alert(`Vị trí thiết bị chỉ chính xác trong khoảng ${Math.round(accuracy)}m. Bạn nên kéo ghim để chỉnh lại.`);
        }

        this.zone.run(() => {
          this.setPinnedLocation(lat, lng, true, true);
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

  markDirty(): void {
    this.isDirty.set(true);
  }

  hasPinnedLocation(): boolean {
    return this.infoForm.lat !== null && this.infoForm.lng !== null;
  }

  formCompletionPercent(): number {
    let completed = 0;

    if (this.infoForm.name.trim()) completed += 1;
    if (this.infoForm.type) completed += 1;
    if (this.infoForm.description.trim()) completed += 1;
    if (this.infoForm.addressDetail.trim()) completed += 1;
    if (this.hasPinnedLocation()) completed += 1;

    return Math.round((completed / 5) * 100);
  }

  saveChanges(): void {
    if (!this.infoForm.name.trim()) {
      alert('Vui lòng nhập tên chỗ nghỉ.');
      return;
    }

    if (!this.infoForm.addressDetail.trim()) {
      alert('Vui lòng nhập địa chỉ chỗ nghỉ.');
      return;
    }

    if (!this.hasPinnedLocation()) {
      alert('Vui lòng ghim vị trí chỗ nghỉ trên bản đồ.');
      return;
    }

    if (!this.homestayId) {
      alert('Không tìm thấy ID chỗ nghỉ!');
      return;
    }

    this.isSaving.set(true);

    let mapCategoryId = 1;

    if (this.infoForm.type === 'VILLA') {
      mapCategoryId = 2;
    } else if (this.infoForm.type === 'HOUSE') {
      mapCategoryId = 3;
    }

    const payload = {
      categoryId: mapCategoryId,
      name: this.infoForm.name.trim(),
      description: this.infoForm.description.trim(),
      addressDetail: this.infoForm.addressDetail.trim(),
      city: this.infoForm.city,
      latitude: this.infoForm.lat,
      longitude: this.infoForm.lng
    };

    console.log('Payload Update:', payload);

    this.homestayService.updateHomestay(this.homestayId, payload).subscribe({
      next: res => {
        this.isSaving.set(false);

        if (res.success) {
          this.isDirty.set(false);
          this.toastService.show('success','Chỉnh sửa thành công',res.message)
        } else {
           this.toastService.show('error','Chỉnh sửa thất bại',res.message)
        }
      },
      error: err => {
        console.error('Lỗi update:', err);
        this.isSaving.set(false);
        alert('Có lỗi xảy ra khi lưu thông tin.');
      }
    });
  }

}