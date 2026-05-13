import { Component, computed, effect, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Thêm isPlatformBrowser
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';

@Component({
  selector: 'app-homestay-location',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homestay-location.html',
  styleUrl: './homestay-location.css',
})
export class HomestayLocation implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  private map: any; // Dùng any để tránh lỗi type khi chưa import Leaflet
  private marker: any;
  private isBrowser: boolean;

  homestay = computed(() => this.homestayService.currentHomestay());
  
  coords = computed(() => {
    const h = this.homestay();
    return {
      lat: h?.latitude != null ? Number(h.latitude) : 64.1265,
      lng: h?.longitude != null ? Number(h.longitude) : -21.8174
    };
  });

  constructor(
    private homestayService: HomestayService,
    @Inject(PLATFORM_ID) platformId: Object // Inject để kiểm tra môi trường
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const { lat, lng } = this.coords();
      if (this.isBrowser && this.map) {
        this.updateMap(lat, lng);
      }
    });
  }

  async ngAfterViewInit() {
    // Chỉ khởi tạo map nếu đang ở trình duyệt
    if (this.isBrowser) {
      await this.initMap();
    }
  }

  private async initMap() {
    // Dynamic import Leaflet để nó không bị gọi khi chạy trên Server
    const L = await import('leaflet');
    
    const { lat, lng } = this.coords();
    
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-[#173124]/20 rounded-full animate-ping"></div>
          <div class="w-10 h-10 bg-[#173124] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-white text-sm" style="font-variation-settings: 'FILL' 1;">home</span>
          </div>
        </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    this.marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
  }

  private updateMap(lat: number, lng: number) {
    if (this.map) {
      this.map.setView([lat, lng], 13);
      this.marker.setLatLng([lat, lng]);
    }
  }

  openDirections() {
    const { lat, lng } = this.coords();
    if (this.isBrowser) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  }

  ngOnDestroy() {
    if (this.isBrowser && this.map) {
      this.map.remove();
    }
  }
}