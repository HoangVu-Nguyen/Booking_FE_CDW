import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { ApiResponse } from '../../models/response/api.response';
import { ApiService } from '../api/api.service';
import { ChatHistoryResponse, MessageResponse } from '../../models/response/chat.response';
import { Conversation } from '../../models/response/booking.response';

export type ChatContext = 'ADMIN' | 'HOST' | 'GROUP';

@Injectable({ providedIn: 'root' })
export class ChatStateService {
  private apiService = inject(ApiService);

  // ==========================================
  // 1. TRẠNG THÁI ĐIỀU KHIỂN UI
  // ==========================================
  isOpen = signal<boolean>(false);
  activeContext = signal<ChatContext>('ADMIN');
  currentTargetId = signal<number | null>(0); // 0 = Admin mặc định

  // Lưu trữ ngữ cảnh Host thông minh khi xem trang chi tiết
  autoTargetHost = signal<{ id: number, name: string, avatar: string } | null>(null);

  // ==========================================
  // 2. TRẠNG THÁI DỮ LIỆU TIN NHẮN (DYNAMIC STATE)
  // ==========================================
  activeMessages = signal<MessageResponse[]>([]);
  nextCursor = signal<number | null>(null);
  hasNextMessages = signal<boolean>(false);
  isLoadingMessages = signal<boolean>(false);

  // ==========================================
  // 3. DANH SÁCH CUỘC HỘI THOẠI (MOCK/API DATA)
  // ==========================================
  adminConversation = signal<Conversation>({
    id: 0, type: 'ADMIN', name: 'Clyvasync Support', avatar: 'support_agent', unreadCount: 0
  });

  groupConversations = signal<Conversation[]>([]);
  
  hostConversations = signal<Conversation[]>([
   
  ]);

  // ==========================================
  // 4. TỰ ĐỘNG TRIGGER KHI ĐỔI PHÒNG CHAT
  // ==========================================
  constructor() {
    // Luôn lắng nghe currentTargetId, hễ đổi ID phòng chat là tự thọc API lấy tin mới
    effect(() => {
      const id = this.currentTargetId();
      if (id !== null) {
        this.loadChatHistory(id, null); // Load trang đầu tiên (cursor = null)
      } else {
        this.activeMessages.set([]);
        this.nextCursor.set(null);
        this.hasNextMessages.set(false);
      }
    }, { allowSignalWrites: true });
  }

  // ==========================================
  // 5. CÁC HÀM XỬ LÝ API (ACTIONS)
  // ==========================================
  
  // Tải lịch sử chat (Trang đầu hoặc tải thêm tin cũ)
  loadChatHistory(conversationId: number, cursor?: number | null, limit: number = 10) {
    this.isLoadingMessages.set(true);
    let params: any = { limit };
    if (cursor) params.cursor = cursor;

    this.apiService.get<ApiResponse<ChatHistoryResponse>>(`/api/v1/chat/conversations/${conversationId}/messages`, params)
      .subscribe({
        next: (res) => {
          console.log(res)
          if (res.data) {
            const { messages, nextCursor, hasNext } = res.data;
            this.nextCursor.set(nextCursor);
            this.hasNextMessages.set(hasNext);

            if (cursor) {
              // Ghim nối tiếp tin nhắn cũ lên đầu khung chat
              this.activeMessages.update(msgs => [...messages, ...msgs]);
            } else {
              // Ghi đè tin mới hoàn toàn khi chuyển phòng chat
              this.activeMessages.set(messages);
            }
          }
          this.isLoadingMessages.set(false);
        },
        error: (err) => {
          console.error('Lỗi tải tin nhắn:', err);
          this.isLoadingMessages.set(false);
        }
      });
  }

  // Hàm dành riêng cho hiệu ứng Infinite Scroll cuộn lên đỉnh
  loadMoreOldMessages() {
    const currentId = this.currentTargetId();
    const cursor = this.nextCursor();
    
    if (currentId !== null && this.hasNextMessages() && cursor && !this.isLoadingMessages()) {
      this.loadChatHistory(currentId, cursor);
    }
  }

  // ==========================================
  // 6. ĐIỀU HƯỚNG NGỮ CẢNH (UI TRIGGERS)
  // ==========================================
  toggleChat() {
    if (this.isOpen()) {
      this.isOpen.set(false);
    } else {
      const autoHost = this.autoTargetHost();
      if (autoHost) {
        this.openHostChat(autoHost.id, autoHost.name, autoHost.avatar);
      } else {
        this.isOpen.set(true);
      }
    }
  }

  openAdminSupport() {
    this.activeContext.set('ADMIN');
    this.currentTargetId.set(0);
    this.isOpen.set(true);
  }

  openHostChat(hostId: number, hostName: string, hostAvatar: string) {
    const existing = this.hostConversations().find(c => c.id === hostId);

    if (!existing) {
      const newHost: Conversation = {
        id: hostId, type: 'HOST', name: hostName, avatar: hostAvatar, unreadCount: 0
      };
      this.hostConversations.update(list => [newHost, ...list]);
    }

    this.activeContext.set('HOST');
    this.currentTargetId.set(hostId);
    this.isOpen.set(true);
  }

  openGroupChat(groupId: number) {
    this.activeContext.set('GROUP');
    this.currentTargetId.set(groupId);
    this.isOpen.set(true);
  }
}