import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cost-summary',
  standalone: true, // Nếu bác đang dùng Angular 17+ standalone
  imports: [CommonModule],
  templateUrl: './cost-summary.html',
  styleUrl: './cost-summary.css',
})
export class CostSummary {
  // Hứng biến tổng tiền từ Component Cha (PaymentResult)
  amount = input<number>(0);
}