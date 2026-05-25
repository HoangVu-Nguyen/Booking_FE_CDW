import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Danh sách các thông báo đang hiển thị
  toasts = signal<Toast[]>([]);

  // Hàm core để thêm thông báo
  show(type: ToastType, title: string, message: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, title, message };
    
    // Thêm vào danh sách
    this.toasts.update(current => [...current, newToast]);

    // Tự động xóa sau khi hết thời gian (duration)
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  // Hàm xóa thủ công (khi user bấm nút X)
  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  // Các hàm tiện ích (gọi cho nhanh)
  success(title: string, message: string) {
    this.show('success', title, message);
  }

  error(title: string, message: string) {
    this.show('error', title, message);
  }

  info(title: string, message: string) {
    this.show('info', title, message);
  }

  warning(title: string, message: string) {
    this.show('warning', title, message);
  }
}