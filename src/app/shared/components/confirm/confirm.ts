import { Component, inject } from '@angular/core';
import { ConfirmationService } from '../../../core/services/confirm/confirm.service';

@Component({
  selector: 'app-confirm',
  imports: [],
  templateUrl: './confirm.html',
  styleUrl: './confirm.css',
})
export class Confirm {
  service = inject(ConfirmationService);
}
