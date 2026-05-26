import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-mail-menu',
  imports: [],
  templateUrl: './mail-menu.html',
  styleUrl: './mail-menu.css',
})
export class MailMenu {
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();
}
