import { Component, inject,ChangeDetectorRef } from '@angular/core';
import { KycList } from './components/kyc-list/kyc-list';
import { PropertyList } from './components/property-list/property-list';
import { CommonModule } from '@angular/common';
import { KycDetailDrawer } from './components/kyc-detail-drawer/kyc-detail-drawer';
import { AdminService } from '../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-approvals',
  imports: [KycList, PropertyList, CommonModule, KycDetailDrawer],
  templateUrl: './approvals.html',
  styleUrl: './approvals.css',
})
export class Approvals {
  activeTab: 'kyc' | 'property' = 'kyc';
  selectedHost: any;
  drawerOpen = false;
  private adminService = inject(AdminService);
  private changeRef = inject(ChangeDetectorRef);

  openDrawer(hostPreview: any) {

    this.adminService.getKycDetail(hostPreview.profileId).subscribe({
      next: (res) => {
        this.selectedHost = res.data; 
        console.log(res)
        this.drawerOpen = true;
        this.changeRef.detectChanges()
      },
      error: (err) => {
        console.error('Không thể load chi tiết hồ sơ:', err);
      }
    });

    this.drawerOpen = true;

  }

  closeDrawer() {

    this.drawerOpen = false;

  }
}
