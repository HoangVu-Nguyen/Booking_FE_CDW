import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css'] // Có thể để trống
})
export class ChatWidget {
  // Trạng thái mở/đóng khung chat
  isOpen = signal<boolean>(false);
  
  // Tab hiện tại: 'host' hoặc 'group'
  activeTab = signal<'host' | 'group'>('host');

  // Input chat
  newMessage = signal<string>('');

  // ----------------------------------------------------
  // DỮ LIỆU HARDCODE (MOCK DATA) ĐỂ CHECK GIAO DIỆN
  // ----------------------------------------------------
  
  hostMessages = signal([
    { id: 1, senderName: 'Chủ nhà (Clyvasync Villa)', text: 'Chào bạn, cảm ơn bạn đã đặt phòng. Bạn có cần hỗ trợ gì thêm không?', time: '10:00', isMine: false, avatar: 'https://ui-avatars.com/api/?name=Host&background=173124&color=fff' },
    { id: 2, senderName: 'Tôi', text: 'Chào anh/chị, em muốn hỏi có thể check-in sớm lúc 12h được không ạ?', time: '10:05', isMine: true, avatar: '' },
    { id: 3, senderName: 'Chủ nhà (Clyvasync Villa)', text: 'Được bạn nhé, hôm đó phòng trống nên mình hỗ trợ check-in sớm miễn phí cho bạn nha.', time: '10:15', isMine: false, avatar: 'https://ui-avatars.com/api/?name=Host&background=173124&color=fff' }
  ]);

  groupMessages = signal([
    { id: 1, senderName: 'Hải Đăng', text: 'Mọi người ơi, mai mấy giờ tập trung ở cổng thế?', time: '20:00', isMine: false, avatar: 'https://ui-avatars.com/api/?name=HD&background=f59e0b&color=fff' },
    { id: 2, senderName: 'Tôi', text: 'Chắc tầm 8h sáng nhé. Ai có mang loa bluetooth không?', time: '20:10', isMine: true, avatar: '' },
    { id: 3, senderName: 'Thùy Linh', text: 'Mình có nè, để mai mình mang theo cho. Khỏi lo nha! 🎉', time: '20:15', isMine: false, avatar: 'https://ui-avatars.com/api/?name=TL&background=3b82f6&color=fff' }
  ]);

  // Các actions
  toggleChat() {
    this.isOpen.update(v => !v);
  }

  setTab(tab: 'host' | 'group') {
    this.activeTab.set(tab);
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      senderName: 'Tôi',
      text: text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      avatar: ''
    };

    if (this.activeTab() === 'host') {
      this.hostMessages.update(msgs => [...msgs, newMsg]);
    } else {
      this.groupMessages.update(msgs => [...msgs, newMsg]);
    }

    this.newMessage.set('');
    
    // Gợi ý nhỏ: Thường sau khi gửi sẽ scroll xuống bottom
  }
}