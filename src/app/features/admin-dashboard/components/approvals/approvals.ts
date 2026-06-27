import { Component } from '@angular/core';
import { KycList } from './components/kyc-list/kyc-list';
import { PropertyList } from './components/property-list/property-list';
import { CommonModule } from '@angular/common';
import { KycDetailDrawer } from './components/kyc-detail-drawer/kyc-detail-drawer';
@Component({
  selector: 'app-approvals',
  imports: [KycList, PropertyList, CommonModule,KycDetailDrawer],
  templateUrl: './approvals.html',
  styleUrl: './approvals.css',
})
export class Approvals {
  activeTab: 'kyc' | 'property' = 'kyc';
  selectedHost: any;

  drawerOpen = false;

  openDrawer(host: any) {

    this.selectedHost = host;

    this.drawerOpen = true;

  }

  closeDrawer() {

    this.drawerOpen = false;

  }
}
