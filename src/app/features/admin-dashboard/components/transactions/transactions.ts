import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Transaction {
  id: string;
  guest: { name: string; avatar: string };
  host: { name: string; property: string };
  paymentDetails: { method: 'VNPAY' | 'MOMO' | 'VISA' | 'MASTER'; last4?: string; bank?: string };
  amounts: { gross: number; platformFee: number; tax: number; netToHost: number };
  status: 'SETTLED' | 'PENDING' | 'REFUNDED' | 'DISPUTED';
  date: string;
  type: 'PAYMENT_IN' | 'PAYOUT_OUT' | 'REFUND';
}

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.html'
})
export class Transactions {
  // Mock data chuẩn Fintech
  transactions: Transaction[] = [
    {
      id: 'txn_9A8B7C21X', type: 'PAYMENT_IN', status: 'SETTLED', date: '2026-05-22T14:30:22',
      guest: { name: 'Alex Nguyen', avatar: 'https://ui-avatars.com/api/?name=Alex+Nguyen&bg=f5f5f4&color=292524' },
      host: { name: 'Đà Lạt Mộng Mơ', property: 'Căn hộ view hồ Xuân Hương' },
      paymentDetails: { method: 'VISA', last4: '4242' },
      amounts: { gross: 4500000, platformFee: 607500, tax: 67500, netToHost: 3825000 }
    },
    {
      id: 'txn_2F4E1D99Y', type: 'PAYMENT_IN', status: 'PENDING', date: '2026-05-22T09:15:00',
      guest: { name: 'Trần Bích', avatar: 'https://ui-avatars.com/api/?name=Tran+Bich&bg=f5f5f4&color=292524' },
      host: { name: 'Sapa Cloud Villa', property: 'Phòng Deluxe săn mây' },
      paymentDetails: { method: 'VNPAY', bank: 'VCB' },
      amounts: { gross: 12500000, platformFee: 1687500, tax: 187500, netToHost: 10625000 }
    },
    {
      id: 'ref_5C6D7E44Z', type: 'REFUND', status: 'REFUNDED', date: '2026-05-21T18:45:12',
      guest: { name: 'Lê Hoàng', avatar: 'https://ui-avatars.com/api/?name=Le+Hoang&bg=f5f5f4&color=292524' },
      host: { name: 'Hoi An Ancient', property: 'Nhà cổ nguyên căn' },
      paymentDetails: { method: 'MOMO' },
      amounts: { gross: 3200000, platformFee: 0, tax: 0, netToHost: 0 }
    },
    {
      id: 'po_1B2A3C77W', type: 'PAYOUT_OUT', status: 'SETTLED', date: '2026-05-21T10:20:00',
      guest: { name: 'System', avatar: 'https://ui-avatars.com/api/?name=SYS&bg=173124&color=fff' },
      host: { name: 'Ninh Binh Eco', property: 'Quyết toán tuần #3 Tháng 5' },
      paymentDetails: { method: 'MASTER', last4: '8812' },
      amounts: { gross: 0, platformFee: 0, tax: 0, netToHost: 24500000 }
    },
    {
      id: 'txn_8F9E0D11V', type: 'PAYMENT_IN', status: 'DISPUTED', date: '2026-05-20T16:00:00',
      guest: { name: 'Sarah Lee', avatar: 'https://ui-avatars.com/api/?name=Sarah+Lee&bg=f5f5f4&color=292524' },
      host: { name: 'Phu Quoc Sunset', property: 'Villa 3 phòng ngủ biển' },
      paymentDetails: { method: 'VISA', last4: '9001' },
      amounts: { gross: 8900000, platformFee: 1201500, tax: 133500, netToHost: 7565000 }
    }
  ];

  getStatusConfig(status: string) {
    const configs: any = {
      'SETTLED': { bg: 'bg-[#173124]/5', border: 'border-[#173124]/10', text: 'text-[#173124]', dot: 'bg-[#173124]', label: 'Đã quyết toán' },
      'PENDING': { bg: 'bg-amber-50', border: 'border-amber-200/60', text: 'text-amber-700', dot: 'bg-amber-500 animate-pulse', label: 'Đang giữ tiền' },
      'REFUNDED': { bg: 'bg-stone-100', border: 'border-stone-200', text: 'text-stone-600', dot: 'bg-stone-400', label: 'Đã hoàn tiền' },
      'DISPUTED': { bg: 'bg-rose-50', border: 'border-rose-200/60', text: 'text-rose-700', dot: 'bg-rose-500 animate-pulse', label: 'Đang tranh chấp' }
    };
    return configs[status];
  }

  getTypeConfig(type: string) {
    const configs: any = {
      'PAYMENT_IN': { icon: 'arrow_downward', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      'PAYOUT_OUT': { icon: 'arrow_upward', color: 'text-indigo-600', bg: 'bg-indigo-50' },
      'REFUND': { icon: 'keyboard_return', color: 'text-rose-600', bg: 'bg-rose-50' }
    };
    return configs[type];
  }
}