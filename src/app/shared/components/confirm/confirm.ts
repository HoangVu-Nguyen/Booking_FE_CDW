import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ConfirmationService } from '../../../core/services/confirm/confirm.service';
import { SafeHtmlPipe } from '../../../core/pipe/safe-html.pipe';
@Component({
  selector: 'app-confirm',
  imports: [SafeHtmlPipe],
  templateUrl: './confirm.html',
  styleUrl: './confirm.css',
})
export class Confirm {
  service = inject(ConfirmationService);
  @ViewChild('reasonInput') reasonInput!: ElementRef<HTMLTextAreaElement>;

  handleConfirm(onConfirm: (reason: string) => void) {
    const reason = this.reasonInput?.nativeElement.value || '';
    onConfirm(reason);
  }
}
