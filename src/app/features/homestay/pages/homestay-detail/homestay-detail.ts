import { Component, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Thêm cái này
import { HomestayHeader } from './components/homestay-header/homestay-header';
import { HomestayGallery } from './components/homestay-gallery/homestay-gallery';
import { HomestayAmenities } from './components/homestay-amenities/homestay-amenities';
import { HomestayLocation } from './components/homestay-location/homestay-location';
import { HomestayReviews } from './components/homestay-reviews/homestay-reviews';
import { HomestayBookingWidget } from './components/homestay-booking-widget/homestay-booking-widget';
import { HomestayService } from '../../../../core/services/homestay/homestay.service';
import { CommonModule } from '@angular/common'; // Thêm để dùng async pipe hoặc if/else
import { HomestayTours } from './components/homestay-tours/homestay-tours';
@Component({
  selector: 'app-homestay-detail',
  standalone: true, // Đảm bảo component là standalone
  imports: [
    CommonModule,
    HomestayHeader,
    HomestayGallery,
    HomestayAmenities,
    HomestayLocation,
    HomestayReviews,
    HomestayBookingWidget,
    HomestayTours
  ],
  templateUrl: './homestay-detail.html',
  styleUrl: './homestay-detail.css',
})
export class HomestayDetail implements OnInit {

  constructor(
    public homestayService: HomestayService,
    private route: ActivatedRoute // Inject route để đọc param
  ) { }
  homestay = computed(() => this.homestayService.currentHomestay());
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if (id) {
      this.homestayService.getHomestayById(Number(id)).subscribe();
    }
  });
  }
}