import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-ai-room-finder',
  imports: [],
  templateUrl: './ai-room-finder.html',
  styleUrl: './ai-room-finder.css',
})
export class AiRoomFinder {
  @Output() onSearch = new EventEmitter<void>();

  search() {
    this.onSearch.emit();
  }
}
