import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-checkout-payment',
  imports: [],
  templateUrl: './checkout-payment.html',
  styleUrl: './checkout-payment.css',
})
export class CheckoutPayment {
  @Output() methodChange = new EventEmitter<string>();
  selectedMethod = 'VNPAY';

  onMethodSelect(method: string) {
    this.selectedMethod = method;
    this.methodChange.emit(this.selectedMethod);
  }
}
