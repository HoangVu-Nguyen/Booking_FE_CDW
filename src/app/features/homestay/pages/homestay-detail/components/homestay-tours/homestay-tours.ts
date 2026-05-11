import { Component, computed, inject, OnInit } from '@angular/core';
import { HomestayService } from '../../../../../../core/services/homestay/homestay.service';
import { HomestayTour } from './component/homestay-tour/homestay-tour';
@Component({
  selector: 'app-homestay-tours',
  imports: [HomestayTour],
  templateUrl: './homestay-tours.html',
  styleUrl: './homestay-tours.css',
})
export class HomestayTours implements OnInit {
  ngOnInit(): void {
    console.log(this.homestay())
  }
  private homestayService = inject(HomestayService);
  
  homestay = computed(() => this.homestayService.currentHomestay());
}
