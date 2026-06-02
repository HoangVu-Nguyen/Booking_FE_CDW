import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ChatHistoryResponse, ConversationSummaryResponse, MessageResponse, SendMessageRequest } from '../../models/response/chat.response';
import { ApiResponse } from '../../models/response/api.response';
import { PageResponse } from '../../models/response/page.response';
import { BookingContextInfo, ChatInitResponse } from '../../models/response/homestay-card.response';
import { WebsocketService } from '../realtime/websocket.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiService = inject(ApiService);
  public wsService = inject(WebsocketService);
  private authService = inject(OAuthService);

  // --- SIGNALS STATE ---
  conversations = signal<ConversationSummaryResponse[]>([]); // Danh sách phòng chat (Cột 1)
  activeMessages = signal<MessageResponse[]>([]);           // Tin nhắn phòng đang mở (Cột 2)
  activeConversationId = signal<number | null>(null);       // ID phòng đang mở
  totalUnreadCount = signal<number>(0);                     // Tổng số tin chưa đọc hệ thống
  
  nextCursor = signal<number | null>(null);
  hasNextMessages = signal<boolean>(false);
  isLoadingMessages = signal<boolean>(false);
  activeBooking = signal<BookingContextInfo | null>(null);   // Chi tiết đơn đặt phòng (Cột 3)

  constructor() {
    // =========================================================================
    // KÊNH 1: Nhận tin nhắn Realtime trong phòng đang mở để hiển thị ra Khung Giữa
    // =========================================================================
    this.wsService.listenActiveChatMessages().subscribe((newMsg: MessageResponse) => {
      if (newMsg && this.activeConversationId()) {
        
        const isExist = this.activeMessages().some(m => m.id === newMsg.id);
        

        const myCurrentUserId =  this.getCurrentUserId();

      
        const isNotMine = newMsg.senderId != myCurrentUserId; 

        console.log(isNotMine)

          console.log(this.activeMessages())
          console.log(newMsg)
        if (isNotMine) {
          newMsg.mine = false;
          if (!isExist) {
            this.activeMessages.update(msgs => [...msgs, newMsg]);
            console.log('✔ Đã nhận và hiển thị tin nhắn realtime thành công!');
          }
        }
      }
    });

    // =========================================================================
    // KÊNH 2: Nhận tin nhắn Realtime toàn hệ thống hộp thư để cập nhật Cột Trái
    // =========================================================================
    if (this.wsService.inboxNotification$) {
      this.wsService.inboxNotification$.subscribe((newMsg: any) => {
        if (newMsg) {
          this.handleRealtimeIncomingMessage(newMsg, newMsg.conversationId);
        }
      });
    }
  }

  // ==========================================
  // CÁC HÀM XỬ LÝ LOGIC REALTIME NGẦM (HELPER)
  // ==========================================

  /**
   * Xử lý tin nhắn Realtime đổ về toàn hệ thống hộp thư (Cột trái)
   */
  public handleRealtimeIncomingMessage(newMsg: any, conversationId: number) {
    this.conversations.update(convs => {
      const index = convs.findIndex(c => c.id === conversationId);
      
      // Định dạng chuỗi xem trước dựa trên loại tin nhắn
      let previewText = newMsg.content;
      if (newMsg.type === 'IMAGE') previewText = '📷 Đã gửi hình ảnh';
      else if (newMsg.type === 'SYSTEM') previewText = '🔔 Thông báo hệ thống';

      if (index > -1) {
        const existingConv = convs[index];
        
        // Nếu phòng này đang mở sẵn trên màn hình thì unreadCount giữ nguyên = 0
        // Nếu đang chat với người khác mà tin phòng này bay về thì số unread tự động +1
        const isCurrentOpen = this.activeConversationId() === conversationId;
        const newUnreadCount = isCurrentOpen ? 0 : (existingConv.unreadCount || 0) + 1;

        const updatedConv: ConversationSummaryResponse = {
          ...existingConv,
          lastMessage: previewText,
          lastMessageTime: newMsg.time || 'Vừa xong',
          unreadCount: newUnreadCount
        };

        // Cắt phòng chat đó ra khỏi vị trí cũ, ném lên ĐẦU danh sách (Đẩy lên TOP)
        const newConvs = [...convs];
        newConvs.splice(index, 1);
        newConvs.unshift(updatedConv);
        return newConvs;
      } else {
        // Nếu người này chưa từng có trong danh sách Cột trái (Hội thoại hoàn toàn mới)
        // Gọi load lại danh sách phân trang để đồng bộ chuẩn chỉnh từ DB Backend
        this.loadConversations();
        return convs;
      }
    });

    // Cập nhật lại tổng số chuông báo chưa đọc trên toàn hệ thống công cộng
    this.loadTotalUnreadCount();
  }

  // ==========================================
  // CÁC HÀM GỌI API & CẬP NHẬT SIGNAL
  // ==========================================

  /**
   * Lấy danh sách Inbox phân trang từ Backend
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
   * Gửi tin nhắn và cập nhật Optimistic UI cục bộ ngay tắp lự
   */
  sendMessage(conversationId: number, request: SendMessageRequest) {
    this.apiService.post<ApiResponse<MessageResponse>>(`/api/v1/chat/conversations/${conversationId}/messages`, request)
      .subscribe({
        next: (res) => {
          if (res.data) {
            // 1. Đẩy ngay tin nhắn vừa tạo vào màn hình chat giữa
            this.activeMessages.update(msgs => [...msgs, res.data]);

            // 2. Cập nhật dòng preview chữ nhỏ ở Cột trái lên đầu trang mà không cần reload
            this.updateConversationSummaryLocal(conversationId, res.data);
          }
        }
      });
  }

  /**
   * Đánh dấu đã đọc đơn phòng
   */
  markAsRead(conversationId: number, lastMessageId: number) {
    this.apiService.post<ApiResponse<void>>(`/api/v1/chat/conversations/${conversationId}/read`, {}, { lastMessageId })
      .subscribe({
        next: () => {
          this.loadTotalUnreadCount();
          this.conversations.update(convs =>
            convs.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
          );
        }
      });
  }

  /**
   * Hàm hỗ trợ cập nhật nhanh Cột trái khi gửi tin đi (Optimistic UI)
   */
  private updateConversationSummaryLocal(conversationId: number, newMsg: MessageResponse) {
    this.conversations.update(convs => {
      const index = convs.findIndex(c => c.id === conversationId);
      if (index > -1) {
        let previewText = newMsg.content;
        if (newMsg.type === 'IMAGE') previewText = '📷 Đã gửi hình ảnh';
        else if (newMsg.type === 'SYSTEM') previewText = '🔔 Thông báo hệ thống';

        const updatedConv = {
          ...convs[index],
          lastMessage: previewText,
          lastMessageTime: newMsg.time
        };

        const newConvs = [...convs];
        newConvs.splice(index, 1);
        newConvs.unshift(updatedConv);
        return newConvs;
      }
      return convs;
    });
  }

  /**
   * Hàm vạn năng kích hoạt từ trang Chi tiết Homestay hoặc trang Inbox khi click chuột chọn phòng
   */
  initHostConversation(targetUserId: number, shouldReloadList: boolean = false) {
    this.apiService.post<ApiResponse<ChatInitResponse>>(`/api/v1/chat/conversations/init?targetUserId=${targetUserId}`, {})
      .subscribe({
        next: (res) => {
          if (res.data && res.data.conversationId) {
            const { conversationId, name, avatar, booking } = res.data;

            this.activeConversationId.set(conversationId);
            this.activeBooking.set(booking || null);

            this.conversations.update(list => {
              const exists = list.find(c => c.id === conversationId);
              if (!exists) {
                const newConv: ConversationSummaryResponse = {
                  id: conversationId,
                  targetUserId: targetUserId,
                  targetName: name,         
                  targetAvatar: avatar,     
                  lastMessage: 'Bắt đầu cuộc trò chuyện',
                  unreadCount: 0,
                  type: 'HOST',
                  lastMessageTime: new Date().toISOString(),
                  bookingStatus: booking?.status || null, 
                  propertyName: booking?.homestayName || null 
                };
                return [newConv, ...list];
              }
              return list; 
            });

            this.loadChatHistory(conversationId, null);

            if (shouldReloadList) {
              this.loadConversations();
            }
          }
        },
        error: (err) => console.error('Lỗi khi khởi tạo phòng chat:', err)
      });
  }
  /**
   * Hàm tự động bóc tách JWT Token để lấy ID của người dùng đang đăng nhập
   */
  getCurrentUserId(): number {
    const token = this.authService.getAccessToken(); // Hoặc từ authService của bạn
    if (!token) return 0;

    try {
      // JWT gồm 3 phần ngăn cách bởi dấu chấm: Header.Payload.Signature
      // Chúng ta sẽ lấy phần 2 (Payload) để giải mã
      const payloadBase64 = token.split('.')[1];
      
      // Giải mã Base64 sang chuỗi JSON chu đáo (có xử lý ký tự đặc biệt của JWT)
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);

      // LƯU Ý: Bạn hãy check xem Backend của bạn cấu hình lưu ID ở trường nào nhé.
      // Thường Spring Security sẽ lưu ở trường 'id', 'userId' hoặc mặc định là 'sub'
      return payload.id || payload.userId || payload.sub || 0;
    } catch (error) {
      console.error('Lỗi khi giải mã Access Token:', error);
      return 0;
    }
  }
}

// Hàm bổ trợ nhỏ kiểm tra xem có phải tin của chính mình không để tránh render lặp tin nhắn
function msgIsMineLocalCheck(msg: MessageResponse): boolean {
  return msg.mine === true;
}
