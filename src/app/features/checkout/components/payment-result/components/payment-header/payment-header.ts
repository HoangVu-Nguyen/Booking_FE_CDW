import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-payment-header',
  imports: [DecimalPipe],
  templateUrl: './payment-header.html',
  styleUrl: './payment-header.css',
})
export class PaymentHeader {
  status = input<'success' | 'failed'>('success');
  bookingCode = input<string>('');
    amount = input<number>(0);

}
