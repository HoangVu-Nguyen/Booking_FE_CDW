import { Component, ElementRef, Input, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourTimelineInfo } from '../../../../../../core/models/response/trip-detail.response';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image'; // Import thư viện xịn sò thế hệ mới

@Component({
  selector: 'app-booking-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-timeline.html',
  styleUrl: './booking-timeline.css',
})
export class BookingTimeline {
  @Input({ required: true }) tours!: TourTimelineInfo[];
  @Input({ required: true }) checkIn!: string;
  @Input({ required: true }) checkOut!: string;
  @Input() propertyName: string = 'Khu nghỉ dưỡng';
  
  @ViewChild('itineraryCanvas', { static: false }) itineraryCanvas!: ElementRef;
  public isPdfGenerating = signal<boolean>(false);


  public downloadItineraryPdf(): void {
    if (!this.itineraryCanvas) {
      console.error('[PDF GENERATION] Target canvas element not found.');
      return;
    }

    this.isPdfGenerating.set(true);
    console.log('[PDF GENERATION] Kích hoạt engine chụp ảnh toàn cảnh (Full-height)...');

    const element = this.itineraryCanvas.nativeElement;

    const fullWidth = element.scrollWidth;
    const fullHeight = element.scrollHeight;

    const options = {
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      // Ép ống kính chụp kích thước full size
      width: fullWidth,
      height: fullHeight,
      style: {
        overflow: 'visible',
        margin: '0'
      }
    };

    toPng(element, options)
      .then((dataUrl) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210; // Kích thước bề ngang giấy A4 (mm)
        const pageHeight = 295; // Kích thước bề dọc giấy A4 (mm)
        
        // Tính toán tỷ lệ chiều cao ảnh so với khổ giấy
        const imgHeight = (fullHeight * pdfWidth) / fullWidth;
        let heightLeft = imgHeight;
        let position = 0; 

        // Dán ảnh trang 1
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

     
        while (heightLeft > 0) {
          position = heightLeft - imgHeight; // Đẩy tọa độ ảnh lùi lên trên
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
        }

        pdf.save('clyvasync-itinerary.pdf');
        
        this.isPdfGenerating.set(false);
        console.log('[PDF GENERATION] Xuất file PDF full chiều dài thành công!');
      })
      .catch((error) => {
        console.error('[PDF GENERATION] Bị lỗi trong lúc chụp ảnh:', error);
        this.isPdfGenerating.set(false);
      });
  }
  public handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AABQBAyM/hGkAAAAASUVORK5CYII=';
  }
}