import { Injectable, signal, inject } from '@angular/core';
import { ChatService } from './chat.service'; // Inject ChatService vào đây

export type ChatContext = 'ADMIN' | 'HOST' | 'GROUP';

@Injectable({ providedIn: 'root' })
export class ChatStateService {
  private chatService = inject(ChatService);

  // 1. TRẠNG THÁI UI (MỞ/ĐÓNG POPUP)
  isOpen = signal<boolean>(false);
  activeContext = signal<ChatContext>('ADMIN');

  // Các biến phụ để test (Bạn có thể bỏ nếu không dùng)
  autoTargetHost = signal<{ id: number, name: string, avatar: string } | null>(null);

  // Tắt/Mở khung chat
 toggleChat() {
    if (this.isOpen()) {
      this.isOpen.set(false);
    } else {
      const autoHost = this.autoTargetHost();
      console.log(autoHost)
      if (autoHost) {
        // Tự động nhảy sang tab Host và mở phòng chat
        this.openHostChat(autoHost.id, autoHost.name, autoHost.avatar);
        
        // DỌN DẸP: Xóa ngữ cảnh này đi sau khi đã khởi tạo xong
        // Để lần sau nếu người dùng muốn chat với người khác, 
        // nó không bị ghi đè nhầm lẫn
      } else {
        this.isOpen.set(true);
      }
    }
  }
  // Đổi sang tab Admin
  openAdminSupport() {
    this.activeContext.set('ADMIN');
    this.isOpen.set(true);
    // (Tuỳ chọn) Bạn có thể gọi chatService.loadChatHistory(0) ở đây
  }

  // NÚT BẤM TỪ TRANG CHI TIẾT: Chat với chủ nhà
  openHostChat(hostId: number, hostName: string, hostAvatar: string) {
    this.activeContext.set('HOST');
    this.isOpen.set(true);
    
    // Giao toàn bộ việc tìm phòng và load tin nhắn cho ChatService
    this.chatService.initHostConversation(hostId);
  }
}