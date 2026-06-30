import { Injectable, signal } from "@angular/core";

// Khai báo interface để dễ quản lý
export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (reason: string) => void;
  showInput: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  public state = signal<ConfirmState | null>(null);

  confirm(title: string, message: string, onConfirm: (reason: string) => void, showInput: boolean = true) {
    this.state.set({ isOpen: true, title, message, onConfirm, showInput });
  }

  close() {
    this.state.set(null);
  }
}