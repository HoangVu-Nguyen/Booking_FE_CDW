import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-list',
  imports: [CommonModule],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css',
})
export class PropertyList {
  pendingDocs = [
    { id: 101, hostName: 'Nguyễn Bùi Hoàng Vũ', docType: 'Sổ đỏ' }
  ];

  openDocumentViewer(doc: any) {
    console.log('Mở Split-Screen Modal cho tài liệu:', doc.id);
  }
}
