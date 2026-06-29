import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../../../core/services/admin/admin.service';

@Component({
  selector: 'app-property-detail-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-detail-drawer.html'
})
export class PropertyDetailDrawer implements OnChanges {
  private adminService = inject(AdminService);

  @Input() open = false;
  @Input() property: any;
  @Output() close = new EventEmitter<void>();
  @Output() actionCompleted = new EventEmitter<void>();
  private changeRef = inject(ChangeDetectorRef);

  isProcessing = false;
  activeDocIndex = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && this.property) {
      this.activeDocIndex = 0;
      if (this.property.documents) {
        this.property.documents.forEach((doc: any) => {
          if (!doc.status) doc.status = 'PENDING';
          
        });
      }
    }
  }

  get currentDoc() {

    return this.property?.documents?.[this.activeDocIndex];
  }

  get isAllReviewed() {
    if (!this.property?.documents) return false;
    return this.property.documents.every((doc: any) => doc.status !== 'PENDING');
  }

  setActiveDoc(index: number) {
    this.activeDocIndex = index;
    this.currentDoc()
    this.changeRef.detectChanges();
  }

  closeDrawer() {
    if (this.isProcessing) return;
    this.close.emit();
    this.changeRef.detectChanges();
  }

  // --- XỬ LÝ TỪNG TÀI LIỆU ---
  approveCurrentDoc() {
    this.currentDoc.status = 'APPROVED';
    this.autoAdvance();
  }

  rejectCurrentDoc() {
    const reason = prompt(`Nhập lý do từ chối [${this.currentDoc.name}]:`);
    if (reason && reason.trim() !== '') {
      this.currentDoc.status = 'REJECTED';
      this.currentDoc.rejectReason = reason;
      this.autoAdvance();
    }
  }

  autoAdvance() {
    const nextPendingIndex = this.property.documents.findIndex((d: any) => d.status === 'PENDING');
    if (nextPendingIndex !== -1) {
      this.activeDocIndex = nextPendingIndex;
    }
  }

  submitReview() {
    this.isProcessing = true;
    
    const payload = {
      documents: this.property.documents.map((d: any) => ({
        documentId: d.id,
        status: d.status,
        rejectReason: d.rejectReason || null
      }))
    };

    const homestayId = this.property.id.toString().replace('PRP-', '');

    this.adminService.submitPropertyReview(Number(homestayId), payload).subscribe({
      next: () => {
        alert('Đã lưu kết quả kiểm duyệt thành công!');
        this.isProcessing = false;
        this.actionCompleted.emit(); 
        this.closeDrawer();
      },
      error: (err) => {
        console.error('Lỗi khi submit review:', err);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
        this.isProcessing = false;
      }
    });
  }
}