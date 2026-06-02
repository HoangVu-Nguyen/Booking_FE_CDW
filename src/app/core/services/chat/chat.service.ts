import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ChatHistoryResponse, ConversationSummaryResponse, MessageResponse, SendMessageRequest } from '../../models/response/chat.response';
import { ApiResponse } from '../../models/response/api.response';
import { PageResponse } from '../../models/response/page.response';
import { BookingContextInfo, ChatInitResponse } from '../../models/response/homestay-card.response';

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
  isLoadingMessages = signal<boolean>(false);
  activeBooking = signal<BookingContextInfo | null>(null);
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
          console.log(res)
          if (res.data) {
            console.log(this.activeMessages())
            // 1. Thêm ngay tin nhắn vừa gửi vào cuối mảng để UI hiện lập tức
            this.activeMessages.update(msgs => [...msgs, res.data]);
            console.log(this.activeMessages())

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
  initHostConversation(targetUserId: number) {
    // 1. Đổi kiểu trả về thành ChatInitResponse
    this.apiService.post<ApiResponse<ChatInitResponse>>(`/api/v1/chat/conversations/init?targetUserId=${targetUserId}`, {})
      .subscribe({
        next: (res) => {
          console.log('Dữ liệu phòng chat mới:', res);

          if (res.data && res.data.conversationId) {
            const { conversationId, name, avatar, booking } = res.data;
            console.log(booking)

            // 2. Set ID phòng chat hiện tại
            this.activeConversationId.set(conversationId);

            // 3. Set thông tin Booking để UI hiển thị thẻ đơn hàng
            this.activeBooking.set(booking || null);

            // 4. Update thông tin Host vào danh sách Cột 1 (Inbox) ngay lập tức để Header có tên
            this.conversations.update(list => {
              const exists = list.find(c => c.id === conversationId);
              if (!exists) {
                // Tạo một object ĐẦY ĐỦ các trường theo đúng interface
                const newConv: ConversationSummaryResponse = {
                  id: conversationId,
                  targetName: name,         // Sửa 'name' thành 'targetName'
                  targetAvatar: avatar,     // Sửa 'avatar' thành 'targetAvatar'
                  lastMessage: 'Bắt đầu cuộc trò chuyện',
                  unreadCount: 0,
                  type: 'HOST',
                  lastMessageTime: new Date().toISOString(), // Lấy giờ hiện tại
                  bookingStatus: this.activeBooking()?.status || null, 
                  propertyName: this.activeBooking()?.homestayName || null 
                };

                return [newConv, ...list];
              }
              return list; // Nếu có rồi thì giữ nguyên
            });

            // 5. Tải lịch sử tin nhắn
            this.loadChatHistory(conversationId, null);

            // 6. Có thể gọi loadConversations để đồng bộ lại danh sách chuẩn xác từ BE
            this.loadConversations();
          }
        },
        error: (err) => {
          console.error('Lỗi khi khởi tạo phòng chat:', err);
        }
      });
  }
  
}