import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'WALLET' | 'BANK';
  brand: string;
  last4: string;
  expiry?: string;
  isDefault: boolean;
  status: 'ACTIVE' | 'EXPIRED';
  iconUrl: string;
  bgClass?: string; // Dùng màu Matte nguyên bản
}

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-methods.html'
})
export class PaymentMethods {
  
  // Trạng thái bật/tắt form thêm thẻ
  isAddingNew = signal(false);

  // Dữ liệu Mockup tinh giản
  methods = signal<PaymentMethod[]>([
    {
      id: 'card_1',
      type: 'CARD',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/26',
      isDefault: true,
      status: 'ACTIVE',
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png',
      bgClass: 'bg-[#0f172a]' // Slate 900 - Matte Black
    },
    {
      id: 'card_2',
      type: 'CARD',
      brand: 'Mastercard',
      last4: '8899',
      expiry: '05/28',
      isDefault: false,
      status: 'ACTIVE',
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
      bgClass: 'bg-[#0369a1]' // Sky 700 - Deep Blue
    },
    {
      id: 'wallet_1',
      type: 'WALLET',
      brand: 'MoMo',
      last4: '090****204',
      isDefault: false,
      status: 'ACTIVE',
      iconUrl: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png'
    },
    {
      id: 'bank_1',
      type: 'BANK',
      brand: 'Vietcombank',
      last4: '1122',
      isDefault: false,
      status: 'ACTIVE',
      iconUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Icon-Vietcombank.png'
    }
  ]);

  toggleAddForm() {
    this.isAddingNew.update(v => !v);
  }

  setAsDefault(id: string) {
    this.methods.update(list => list.map(m => ({ ...m, isDefault: m.id === id })));
  }

  removeMethod(id: string) {
    this.methods.update(list => list.filter(m => m.id !== id));
  }
}