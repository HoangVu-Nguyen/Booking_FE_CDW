import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ChatHistoryResponse, ConversationSummaryResponse, MessageResponse, SendMessageRequest } from '../../models/response/chat.response';
import { ApiResponse } from '../../models/response/api.response';
import { PageResponse } from '../../models/response/page.response';

// Định nghĩa interface cho 1 cuộc hội thoại (Conversation)

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiService = inject(ApiService);

  // --- SIGNALS STATE ---
  // Lưu danh sách phòng chat (Cột 1)
  conversations = signal<ConversationSummaryResponse[]>([]);

  // Lưu danh sách tin nhắn của phòng đang mở (Cột 2)
  activeMessages = signal<MessageResponse[]>([]);

  // ID của phòng đang mở
  activeConversationId = signal<number | null>(null);

  // Tổng số tin nhắn chưa đọc (Hiển thị ở Badge/Chuông Header)
  totalUnreadCount = signal<number>(0);
  nextCursor = signal<number | null>(null);
  hasNextMessages = signal<boolean>(false);

  // ==========================================
  // 3. CÁC HÀM GỌI API & CẬP NHẬT SIGNAL
  // ==========================================

  /**
   * Lấy danh sách Inbox
   */
  loadConversations(filterTab: string = 'ALL', searchQuery: string = '') {
    const params = { filterTab, searchQuery, size: 20 };
    this.apiService.get<ApiResponse<PageResponse<ConversationSummaryResponse>>>('/api/v1/chat/conversations', params)
      .subscribe({
        next: (res) => {
          if (res.data) this.conversations.set(res.data.content);
        },
        error: (err) => console.error('Lỗi tải danh sách chat:', err)
      });
  }

  /**
   * Lấy tổng số tin chưa đọc cho toàn hệ thống
   */
  loadTotalUnreadCount() {
    this.apiService.get<ApiResponse<number>>('/api/v1/chat/unread-count')
      .subscribe({
        next: (res) => {
          if (res.data !== undefined) this.totalUnreadCount.set(res.data);
        }
      });
  }

  /**
   * Tải lịch sử tin nhắn của 1 phòng chat.
   * Có hỗ trợ Cursor để tải thêm tin cũ khi cuộn chuột lên trên.
   */
  loadChatHistory(conversationId: number, cursor?: number | null, limit: number = 10) {
    let params: any = { limit };
    if (cursor) params.cursor = cursor;

    this.apiService.get<ApiResponse<ChatHistoryResponse>>(`/api/v1/chat/conversations/${conversationId}/messages`, params)
      .subscribe({
        next: (res) => {
          if (res.data) {
            const { messages, nextCursor, hasNext } = res.data;

            this.nextCursor.set(nextCursor);
            this.hasNextMessages.set(hasNext);

            if (cursor) {
              this.activeMessages.update(msgs => [...messages, ...msgs]);
            } else {
              this.activeMessages.set(messages);
              this.activeConversationId.set(conversationId);
            }
          }
        },
        error: (err) => console.error('Thất bại khi tải lịch sử chat', err)
      });
  }


  /**
   * Gửi tin nhắn
   */
  sendMessage(conversationId: number, request: SendMessageRequest) {
    this.apiService.post<ApiResponse<MessageResponse>>(`/api/v1/chat/conversations/${conversationId}/messages`, request)
      .subscribe({
        next: (res) => {
          if (res.data) {
            // 1. Thêm ngay tin nhắn vừa gửi vào cuối mảng để UI hiện lập tức
            this.activeMessages.update(msgs => [...msgs, res.data]);

            // 2. Cập nhật lại danh sách Inbox (Đẩy phòng này lên Top và đổi dòng text preview)
            this.updateConversationSummaryLocal(conversationId, res.data);
          }
        }
      });
  }

  /**
   * Đánh dấu đã đọc
   */
  markAsRead(conversationId: number, lastMessageId: number) {
    // Lưu ý API của bạn dùng @RequestParam cho lastMessageId, nên ta bỏ vào params
    this.apiService.post<ApiResponse<void>>(`/api/v1/chat/conversations/${conversationId}/read`, {}, { lastMessageId })
      .subscribe({
        next: () => {
          // 1. Tải lại tổng số chuông đỏ
          this.loadTotalUnreadCount();

          // 2. Update cục bộ Signal danh sách chat: Đưa unreadCount của phòng này về 0
          this.conversations.update(convs =>
            convs.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
          );
        }
      });
  }

  // ==========================================
  // 4. HELPER METHODS (Optimistic UI)
  // ==========================================

  /**
   * Hàm này giúp cập nhật Cột 1 (Inbox) ngay lập tức khi gửi tin nhắn 
   * mà KHÔNG CẦN phải gọi API loadConversations() thêm lần nữa.
   */
  private updateConversationSummaryLocal(conversationId: number, newMsg: MessageResponse) {
    this.conversations.update(convs => {
      const index = convs.findIndex(c => c.id === conversationId);
      if (index > -1) {
        // Tạo chuỗi preview tin nhắn mới
        let previewText = newMsg.content;
        if (newMsg.type === 'IMAGE') previewText = '📷 Đã gửi hình ảnh';
        else if (newMsg.type === 'SYSTEM') previewText = '🔔 Thông báo hệ thống';

        const updatedConv = {
          ...convs[index],
          lastMessage: previewText,
          lastMessageTime: newMsg.time
        };

        // Cắt phòng chat đó ra và nhét lên đầu danh sách (Lên TOP)
        const newConvs = [...convs];
        newConvs.splice(index, 1);
        newConvs.unshift(updatedConv);
        return newConvs;
      }
      return convs; // Nếu không tìm thấy thì giữ nguyên
    });
  }
}