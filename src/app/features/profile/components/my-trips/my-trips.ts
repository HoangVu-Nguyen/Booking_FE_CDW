import { Component } from '@angular/core';
import {RouterModule} from "@angular/router";
import { TripStatus } from '../../../../core/enum/trip-status';
import { Route } from '@angular/router';
import { TripList } from './components/trip-list/trip-list';
import {CommonModule} from "@angular/common";
@Component({
  selector: 'app-my-trips',
  imports: [RouterModule, TripList, CommonModule],
  templateUrl: './my-trips.html',
  styleUrl: './my-trips.css',
})
export class MyTrips {
  public activeTab: TripStatus = 'UPCOMING';

  // Hàm đổi Tab khi user click
  public changeTab(tab: TripStatus): void {
    this.activeTab = tab;
  }
}
