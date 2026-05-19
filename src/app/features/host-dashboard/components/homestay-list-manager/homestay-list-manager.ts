import { Component } from '@angular/core';
import { HomestayItem } from '../homestay-item/homestay-item';
@Component({
  selector: 'app-homestay-list-manager',
  imports: [HomestayItem],
  templateUrl: './homestay-list-manager.html',
  styleUrl: './homestay-list-manager.css',
})
export class HomestayListManager {}
