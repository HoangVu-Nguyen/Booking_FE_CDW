import { Component, inject,ChangeDetectorRef, ViewChild } from '@angular/core';
import { KycList } from './components/kyc-list/kyc-list';
import { PropertyList } from './components/property-list/property-list';
import { CommonModule } from '@angular/common';
import { KycDetailDrawer } from './components/kyc-detail-drawer/kyc-detail-drawer';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { PropertyDetailDrawer } from './components/property-detail-drawer/property-detail-drawer';
@Component({
  selector: 'app-approvals',
  imports: [KycList, PropertyList, CommonModule, KycDetailDrawer,PropertyDetailDrawer],
  templateUrl: './approvals.html',
  styleUrl: './approvals.css',
})
export class Approvals {
  activeTab: 'kyc' | 'property' = 'kyc';
  selectedHost: any;
  drawerOpen = false;
  private adminService = inject(AdminService);
  private changeRef = inject(ChangeDetectorRef);
  pendingCount: number = 0;
  selectedProperty: any;
  propertyDrawerOpen = false;
  @ViewChild(KycList) kycListComponent!: KycList;
  @ViewChild(PropertyList) propertyListComponent!: PropertyList; 
  openDrawer(hostPreview: any) {
    this.selectedHost = null; 
    
    this.adminService.getKycDetail(hostPreview.profileId).subscribe({
      next: (res) => {
        this.selectedHost = res.data; 
        
        this.drawerOpen = true;
        this.changeRef.detectChanges();
      },
      error: (err) => {
        console.error('Không thể load chi tiết hồ sơ:', err);
      }
    });
  }

  closeDrawer() {

    this.drawerOpen = false;

  }
  handleActionCompleted() {
    if (this.kycListComponent) {
      this.kycListComponent.fetchPendingKyc();
    }
  }
 openPropertyDrawer(propertyData: any) {
    // Tạm thời gán data tĩnh từ bảng, sau này có API detail thì ông call y hệt phần KYC
    this.selectedProperty = propertyData;
    this.propertyDrawerOpen = true;
    this.changeRef.detectChanges();
  }

  closePropertyDrawer() {
    this.propertyDrawerOpen = false;
  }
  handlePropertyActionCompleted() {
    if (this.propertyListComponent) {
        this.propertyListComponent.fetchPendingProperties();
    }
}
}
