import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  private _state = signal<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
  public state = this._state.asReadonly();

  confirm(title: string, message: string, onConfirm: () => void) {
    this._state.set({ isOpen: true, title, message, onConfirm });
  }

  close() {
    this._state.set(null);
  }
}