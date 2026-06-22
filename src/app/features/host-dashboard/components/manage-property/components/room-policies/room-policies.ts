import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingMode } from '../../../../../../core/models/response/room.response';

type CancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT' | 'NON_REFUNDABLE';

interface PolicyOption<T extends string> {
  value: T;
  title: string;
  description: string;
  icon: string;
}

interface RoomPolicyForm {
  checkInFrom: string;
  checkInTo: string;
  checkOutBefore: string;

  minNights: number;
  maxNights: number | null;

  bookingMode: BookingMode;
  cancellationPolicy: CancellationPolicy;

  childrenAllowed: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partyAllowed: boolean;

  quietHoursEnabled: boolean;
  quietFrom: string;
  quietTo: string;

  depositRequired: boolean;
  depositAmount: number | null;

  extraNotes: string;
}

@Component({
  selector: 'app-room-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-policies.html',
  styleUrl: './room-policies.css',
})
export class RoomPolicies {
  isSaving = signal(false);
  isDirty = signal(false);
  showSavedToast = signal(false);

  form = signal<RoomPolicyForm>({
    checkInFrom: '14:00',
    checkInTo: '22:00',
    checkOutBefore: '12:00',

    minNights: 1,
    maxNights: null,

    bookingMode: 'INSTANT_BOOKING',
    cancellationPolicy: 'FLEXIBLE',

    childrenAllowed: true,
    petsAllowed: false,
    smokingAllowed: false,
    partyAllowed: false,

    quietHoursEnabled: true,
    quietFrom: '22:00',
    quietTo: '06:00',

    depositRequired: false,
    depositAmount: null,

    extraNotes: 'Vui lòng giữ gìn vệ sinh chung và không gây ồn sau 22:00.'
  });

bookingModes: PolicyOption<BookingMode>[] = [
  {
    value: 'INSTANT_BOOKING',
    title: 'Đặt ngay',
    description: 'Khách có thể đặt phòng ngay nếu còn phòng trống.',
    icon: 'bolt'
  },
  {
    value: 'REQUEST_TO_BOOK',
    title: 'Yêu cầu xác nhận',
    description: 'Host cần xác nhận trước khi khách hoàn tất đặt phòng.',
    icon: 'task_alt'
  },
  {
    value: 'CLOSED',
    title: 'Tạm đóng đặt phòng',
    description: 'Phòng vẫn hiển thị nhưng khách không thể đặt.',
    icon: 'block'
  }
];

cancellationPolicies: PolicyOption<CancellationPolicy>[] = [
  {
    value: 'FLEXIBLE',
    title: 'Linh hoạt',
    description: 'Khách có thể huỷ miễn phí trước thời hạn quy định.',
    icon: 'event_available'
  },
  {
    value: 'MODERATE',
    title: 'Trung bình',
    description: 'Hoàn tiền một phần nếu khách huỷ sát ngày nhận phòng.',
    icon: 'event_repeat'
  },
  {
    value: 'STRICT',
    title: 'Nghiêm ngặt',
    description: 'Chính sách huỷ chặt hơn, phù hợp mùa cao điểm.',
    icon: 'gpp_maybe'
  },
  {
    value: 'NON_REFUNDABLE',
    title: 'Không hoàn tiền',
    description: 'Giá tốt hơn nhưng không áp dụng hoàn tiền.',
    icon: 'lock'
  }
];

  summaryItems = computed(() => {
    const form = this.form();

    return [
      {
        icon: 'login',
        label: 'Nhận phòng',
        value: `${form.checkInFrom} - ${form.checkInTo}`
      },
      {
        icon: 'logout',
        label: 'Trả phòng',
        value: `Trước ${form.checkOutBefore}`
      },
      {
        icon: 'calendar_month',
        label: 'Số đêm',
        value: form.maxNights
          ? `${form.minNights} - ${form.maxNights} đêm`
          : `Tối thiểu ${form.minNights} đêm`
      },
      {
        icon: form.bookingMode === 'INSTANT_BOOKING' ? 'bolt' : 'task_alt',
        label: 'Kiểu đặt',
        value: form.bookingMode === 'INSTANT_BOOKING' ? 'Đặt ngay' : 'Yêu cầu xác nhận'
      }
    ];
  });

  updateField<K extends keyof RoomPolicyForm>(field: K, value: RoomPolicyForm[K]): void {
    this.form.update(old => ({
      ...old,
      [field]: value
    }));

    this.markDirty();
  }

  updateNumberField(field: 'minNights' | 'maxNights' | 'depositAmount', value: string): void {
    const parsed = value === '' ? null : Number(value);

    this.form.update(old => ({
      ...old,
      [field]: parsed
    }));

    this.markDirty();
  }

  selectBookingMode(mode: BookingMode): void {
    this.updateField('bookingMode', mode);
  }

  selectCancellationPolicy(policy: CancellationPolicy): void {
    this.updateField('cancellationPolicy', policy);
  }

  toggleBoolean(field: keyof Pick<
    RoomPolicyForm,
    'childrenAllowed' | 'petsAllowed' | 'smokingAllowed' | 'partyAllowed' | 'quietHoursEnabled' | 'depositRequired'
  >): void {
    this.form.update(old => ({
      ...old,
      [field]: !old[field]
    }));

    this.markDirty();
  }

  markDirty(): void {
    this.isDirty.set(true);
  }

  resetForm(): void {
    const ok = confirm('Bạn có chắc muốn khôi phục lại chính sách mặc định không?');

    if (!ok) return;

    this.form.set({
      checkInFrom: '14:00',
      checkInTo: '22:00',
      checkOutBefore: '12:00',
      minNights: 1,
      maxNights: null,
      bookingMode: 'INSTANT_BOOKING',
      cancellationPolicy: 'FLEXIBLE',
      childrenAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      partyAllowed: false,
      quietHoursEnabled: true,
      quietFrom: '22:00',
      quietTo: '06:00',
      depositRequired: false,
      depositAmount: null,
      extraNotes: 'Vui lòng giữ gìn vệ sinh chung và không gây ồn sau 22:00.'
    });

    this.markDirty();
  }

  saveChanges(): void {
    this.isSaving.set(true);

    console.log('Room policy payload:', this.form());

    setTimeout(() => {
      this.isSaving.set(false);
      this.isDirty.set(false);
      this.showSavedToast.set(true);

      setTimeout(() => {
        this.showSavedToast.set(false);
      }, 2400);
    }, 700);
  }
}