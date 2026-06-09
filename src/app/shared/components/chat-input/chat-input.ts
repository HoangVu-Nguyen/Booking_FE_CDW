import { Component, EventEmitter, Output, signal } from '@angular/core';
import { ChatSendPayload } from '../../../core/models/file/file.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-chat-input',
  imports: [FormsModule,CommonModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  // Bắn dữ liệu ra cho Component cha (Inbox / ChatWidget)
  @Output() sendMsg = new EventEmitter<ChatSendPayload>();
  
  newMessage = signal<string>('');

  // Hàm xử lý gửi tin
  onSend() {
    const text = this.newMessage().trim();
    if (!text) return;

    // Bắn event ra ngoài kèm data
    this.sendMsg.emit({ 
      content: text,
      files: [] // Sau này ông nhét mảng file đã chọn vào đây
    });

    // Reset lại ô input sau khi gửi
    this.newMessage.set('');
  }

  // Tiện ích: Nhấn Enter để gửi, Shift + Enter để xuống dòng
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Ngăn không cho textarea tự xuống dòng
      this.onSend();
    }
  }

  // Khung sườn để xử lý chọn file sau này
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Đã chọn file:', files);
      // Code lưu file vào biến mảng để preview...
    }
    // Xoá value để chọn lại cùng 1 file không bị lỗi
    event.target.value = ''; 
  }
}
