import { Component, EventEmitter, Output, signal } from '@angular/core';
import { ChatSendPayload } from '../../../core/models/file/file.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  @Output() sendMsg = new EventEmitter<ChatSendPayload>();
  
  newMessage = signal<string>('');
  
  // Đmanager trạng thái đóng/mở của menu tiện ích mở rộng
  isMenuOpen = signal<boolean>(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  // Hàm bổ trợ click hộ thẻ input ẩn và tự động đóng menu
  triggerInput(inputElement: HTMLInputElement) {
    inputElement.click();
    this.isMenuOpen.set(false);
  }

  onSend() {
    const text = this.newMessage().trim();
    if (!text) return;

    this.sendMsg.emit({ 
      content: text,
      files: [] 
    });

    this.newMessage.set('');
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); 
      this.onSend();
    }
  }


onFileSelected(event: any, type: 'IMAGE' | 'FILE') {
  const selectedFiles: File[] = Array.from(event.target.files || []);
  if (selectedFiles.length === 0) return;

  // Bắn nguyên lô file THẬT ra cho Component cha xử lý luồng upload S3
  this.sendMsg.emit({
    content: '', // Tin nhắn trống vì đây là luồng gửi ảnh độc lập
    files: selectedFiles
  });

  event.target.value = ''; // Reset input
}
}