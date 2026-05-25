import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-message-menu',
  imports: [CommonModule],
  templateUrl: './message-menu.html',
  styleUrl: './message-menu.css',
})
export class MessageMenu {
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();
}
