import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {WebsocketService} from '../../../../core/services/realtime/websocket.service';
import { ChatService } from '../../../../core/services/chat/chat.service';
import { Conversation, Message } from '../../../../core/models/response/chat-detail.reponse';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox.html',
  styleUrls: ['./inbox.css'],
})
export class Inbox  implements OnInit{
  ngOnInit(): void {
    this.websocketService.subscribeToChatRoom(1);
  }
  searchQuery = signal<string>('');
  activeTab = signal<'ALL' | 'UNREAD' | 'STARRED'>('ALL');
  newMessage = signal<string>('');
  activeConversationId = signal<number>(1);
  private websocketService = inject(WebsocketService);
  private chatService = inject(ChatService);

  // MOCK DATA: Chuẩn dữ liệu OTA
  conversations = signal<Conversation[]>([
    {
      id: 1,
      guestName: 'Nguyễn Văn Hải',
      guestAvatar: 'https://ui-avatars.com/api/?name=NVH&background=f3f4f6&color=374151',
      lastMessage: 'Dạ vâng, em cảm ơn. Hẹn gặp anh/chị ạ!',
      lastMessageTime: '10:30',
      unreadCount: 1,
      status: 'PRE_ARRIVAL',
      booking: {
        code: 'BK-882910',
        property: 'Clyvasync Premium Villa - Đà Lạt',
        propertyImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=400&auto=format&fit=crop',
        checkIn: '28 Thg 05, 2026',
        checkOut: '30 Thg 05, 2026',
        guests: 4,
        totalPrice: 4500000,
        paymentStatus: 'PAID'
      },
      messages: [
        { id: 1, text: 'Chào anh/chị, nhà mình có chỗ đậu xe ô tô 7 chỗ không ạ? Em dự định tới lúc 2h chiều.', time: '09:15', isMine: false },
        { id: 2, text: 'Chào Hải, Villa bên mình có sân đỗ xe riêng rộng rãi, an toàn. Bạn báo sớm khoảng 30p trước khi tới để quản gia mở cổng nhé.', time: '10:00', isMine: true },
        { id: 3, text: 'Dạ vâng, em cảm ơn. Hẹn gặp anh/chị ạ!', time: '10:30', isMine: false }
      ]
    },
    {
      id: 2,
      guestName: 'Elena Gilbert',
      guestAvatar: 'https://ui-avatars.com/api/?name=EG&background=f3f4f6&color=374151',
      lastMessage: 'Is it possible to have a late check-out?',
      lastMessageTime: 'Hôm qua',
      unreadCount: 0,
      status: 'IN_HOUSE',
      booking: {
        code: 'BK-109234',
        property: 'Clyvasync Studio - Quận 1',
        propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400&auto=format&fit=crop',
        checkIn: '25 Thg 05, 2026',
        checkOut: '27 Thg 05, 2026',
        guests: 2,
        totalPrice: 1200000,
        paymentStatus: 'PAID'
      },
      messages: [
        { id: 1, text: 'Hi there, we are enjoying our stay! Is it possible to have a late check-out tomorrow?', time: '20:15', isMine: false }
      ]
    }
  ]);

  activeConv = computed(() => 
    this.conversations().find(c => c.id === this.activeConversationId())
  );

  filteredConversations = computed(() => {
    let filtered = this.conversations();
    if (this.activeTab() === 'UNREAD') {
      filtered = filtered.filter(c => c.unreadCount > 0);
    }
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(c => 
        c.guestName.toLowerCase().includes(query) || 
        c.booking.code.toLowerCase().includes(query)
      );
    }
    return filtered;
  });

  selectConversation(id: number) {
    this.activeConversationId.set(id);
    this.conversations.update(list => list.map(c => 
      c.id === id ? { ...c, unreadCount: 0 } : c
    ));
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text) return;
   // const currentId = this.activeConversationId();
    const currentId = 1
    const newMsg: Message = { id: Date.now(), text: text, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), isMine: true };
    this.conversations.update(list => list.map(c => {
      if (c.id === currentId) { return { ...c, lastMessage: text, lastMessageTime: newMsg.time, messages: [...c.messages, newMsg] }; }
      return c;
    }));
    this.chatService.sendMessage(currentId, { content: text, type: 'TEXT' });
    this.newMessage.set('');
  }
}