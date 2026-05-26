import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatContext, ChatStateService } from '../../../core/services/chat/chat-state.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css']
})
export class ChatWidget {
  public chatState = inject(ChatStateService);
  newMessage = signal<string>('');

  currentConversation = computed(() => {
    const context = this.chatState.activeContext();
    const id = this.chatState.currentTargetId();

    if (context === 'ADMIN') return this.chatState.adminConversation();
    if (context === 'HOST') return this.chatState.hostConversations().find(c => c.id === id);
    if (context === 'GROUP') return this.chatState.groupConversations().find(c => c.id === id);
    return null;
  });

  // MOCK DATA TIN NHẮN (Tạm thời gộp chung, sau này bạn gọi API để set lại mảng này dựa trên currentConversation().id )
  messages = signal([
    { id: 1, senderName: 'Clyvasync', text: 'Xin chào! Tôi có thể giúp gì cho chuyến đi của bạn?', time: '10:00', isMine: false, avatar: '' },
    { id: 2, senderName: 'Tôi', text: 'Tôi muốn hỏi về chính sách hủy phòng.', time: '10:05', isMine: true, avatar: '' }
  ]);

  // Lắng nghe sự thay đổi của tab/id để giả lập load tin nhắn mới
  constructor() {
    effect(() => {
      const current = this.currentConversation();
      if (current) {
         // TODO: Khi nối API, bạn sẽ gọi `this.chatService.getMessages(current.id).subscribe(...)` ở đây
         console.log('Đã chuyển sang hội thoại:', current.name);
      }
    });
  }

  setTab(tab: ChatContext) {
    this.chatState.activeContext.set(tab);
    if (tab === 'HOST' && this.chatState.hostConversations().length > 0) {
      this.chatState.currentTargetId.set(this.chatState.hostConversations()[0].id);
    } else if (tab === 'GROUP' && this.chatState.groupConversations().length > 0) {
      this.chatState.currentTargetId.set(this.chatState.groupConversations()[0].id);
    } else if (tab === 'ADMIN') {
      this.chatState.currentTargetId.set(0);
    }
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

    this.messages.update(msgs => [...msgs, newMsg]);
    this.newMessage.set('');
  }
}