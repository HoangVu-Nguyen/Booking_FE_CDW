import { Component, computed, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../../../core/services/realtime/websocket.service';
import { ChatService } from '../../../../core/services/chat/chat.service';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox.html',
  styleUrls: ['./inbox.css'],
})
export class Inbox implements OnInit {
  searchQuery = signal<string>('');
  activeTab = signal<'ALL' | 'UNREAD' | 'STARRED'>('ALL');
  newMessage = signal<string>('');

  private websocketService = inject(WebsocketService);
  public chatService = inject(ChatService); // Đổi thành public để HTML có thể truy cập trực tiếp

  constructor() {
    // 1. Tự động trigger API khi activeTab hoặc searchQuery thay đổi
    effect(() => {
      const tab = this.activeTab();
      const query = this.searchQuery();
      // Gọi API phân trang từ Backend (như hàm getUserConversations bạn đã có)
      this.chatService.loadConversations(tab, query);
    });
  }

  ngOnInit(): void {
    // Tạm thời comment nếu bạn chưa xử lý logic join room websocket động
    // this.websocketService.subscribeToChatRoom(1); 
  }

  // Lấy thẳng danh sách từ Service (đã được lọc từ Backend trả về)
  filteredConversations = computed(() => {
    return this.chatService.conversations();
  });

  // Lấy thông tin tóm tắt của phòng chat ĐANG MỞ (Để render Header ở giữa)
  activeConvSummary = computed(() => 
    this.chatService.conversations().find(c => c.id === this.chatService.activeConversationId())
  );

  // Khi click vào 1 khách hàng bên cột trái
  selectConversation(convId: number, targetUserId: number) {
    this.chatService.activeConversationId.set(convId);
    this.websocketService.subscribeToChatRoom(convId);

    // 1. Fetch lịch sử tin nhắn
    this.chatService.initHostConversation(targetUserId);

    // 2. Fetch chi tiết Booking cho cột bên phải
    // (Bạn cần thêm hàm loadBookingContext(conversationId) vào ChatService)
    // this.chatService.loadBookingContext(id);

    // 3. Đánh dấu đã đọc cục bộ
    this.chatService.conversations.update(list => list.map(c => 
      c.id === convId ? { ...c, unreadCount: 0 } : c
    ));
  }

  // Gửi tin nhắn
  sendMessage() {
    const text = this.newMessage().trim();
    const currentId = this.chatService.activeConversationId();
    
    if (!text || !currentId) return;

    this.chatService.sendMessage(currentId, { content: text, type: 'TEXT' });
    this.newMessage.set('');
  }
}