import {
  Component,
  inject,
  computed,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../core/services/toast/toast.service';
import { ModeratorService } from '../../../core/services/moderator/moderator.service';

import { ChatContext, ChatStateService } from '../../../core/services/chat/chat-state.service';
import { ChatService } from '../../../core/services/chat/chat.service';
import { ConversationSummaryResponse } from '../../../core/models/response/chat.response';
import { WebsocketService } from '../../../core/services/realtime/websocket.service';
import { ChatInput } from '../chat-input/chat-input';
import { ChatSendPayload } from '../../../core/models/file/file.model';
import { FileService } from '../../../core/services/file/file.service';
import { ImageType } from '../../../core/enum/image-type.enum';
import { AiRoomFinder } from '../ai-room-finder/ai-room-finder';
import { AiChatService } from '../../../core/services/ai-chat/ai-chat.service';
@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatInput, AiRoomFinder],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css']
})
export class ChatWidget implements AfterViewChecked {
  public chatState = inject(ChatStateService);
  public chatService = inject(ChatService);
  private router = inject(Router);
  private wsService = inject(WebsocketService);

  @ViewChild('chatScroll') private chatScrollContainer?: ElementRef<HTMLElement>;

  newMessage = signal<string>('');

  private lastConversationKey: string | null = null;
  private lastMessageCount = 0;

  private shouldStickToBottom = true;
  private isPrependingOldMessages = false;
  private isProgrammaticScroll = false;
  private scrollTimeout: any; // Dùng để chặn sự kiện onScroll khi đang cuộn mượt
  public fileService = inject(FileService);
  public aiChatService = inject(AiChatService);
  private toast = inject(ToastService);
  private moderatorService = inject(ModeratorService);
  showAiWidget = false;
  aiMessages = signal<any[]>([]);

  isBookingExpanded = signal<boolean>(false);

  toggleBookingDetails(): void {
    this.isBookingExpanded.set(!this.isBookingExpanded());
  }

  currentConversation = computed(() => {
    const context = this.chatState.activeContext();
    const id = this.chatService.activeConversationId();
    const auto = this.chatState.autoTargetHost();

    const realConv = this.chatService.conversations().find(c => c.id === id);
    if (realConv) return realConv;

    if (context === 'HOST' && auto) {
      return {
        id: -1,
        type: 'HOST',
        targetName: auto.name,
        targetAvatar: auto.avatar,
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0,
        bookingStatus: null,
        propertyName: null
      } as ConversationSummaryResponse;
    }
    return null;
  });
  triggerAiBooking() {
    this.showAiWidget = !this.showAiWidget; // Bật hoặc tắt
  }

  // Hàm nhận thông tin khi nhấn "Bắt đầu tìm phòng" từ component con
  handleAiSearch() {
    this.showAiWidget = false;
    this.setTab('AI');
    this.sendToAi('Xin chào, hãy giúp tôi tìm phòng');
  }

  sendToAi(content: string) {
    if (!content) return;

    // 1. Thêm tin nhắn của người dùng vào mảng
    const tempId = Date.now();
    const userMsg = {
      id: tempId,
      senderId: 0,
      content: content,
      type: 'TEXT' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mine: true,
      attachments: []
    };
    
    // Thêm tin nhắn vào mảng AI cục bộ
    this.aiMessages.update(msgs => [...msgs, userMsg]);
    setTimeout(() => this.scrollToBottom(true), 50);

    // 2. Gọi API backend
    this.aiChatService.chatWithAi(content).subscribe({
      next: (res) => {
        const aiMsg = {
          id: tempId + 1,
          senderId: -1,
          senderName: 'Clyva AI Helper',
          senderAvatar: '', // Có thể để avatar AI mặc định
          content: res.aiMessage,
          type: 'TEXT' as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mine: false,
          attachments: [],
          isAiSuggestion: true,
          suggestedRooms: res.suggestedRooms
        };
        this.aiMessages.update(msgs => [...msgs, aiMsg]);
        setTimeout(() => this.scrollToBottom(true), 50);
      },
      error: (err) => {
        console.error('Lỗi khi gọi AI:', err);
      }
    });
  }
  ngAfterViewChecked(): void {
    const element = this.getScrollElement();
    if (!element) return;

    const context = this.chatState.activeContext();
    const conversation = this.currentConversation();
    const conversationKey = `${context}-${conversation?.id ?? 'none'}`;

    const messages = context === 'AI' ? this.aiMessages() : this.chatService.activeMessages();
    const messageCount = messages.length;

    // 1. KHI ĐỔI PHÒNG CHAT: Cuộn xuống đáy ngay lập tức (Không mượt)
    if (conversationKey !== this.lastConversationKey) {
      this.lastConversationKey = conversationKey;
      this.lastMessageCount = messageCount;
      this.shouldStickToBottom = true;
      this.scrollToBottom(false);
      return;
    }

    if (this.isPrependingOldMessages) {
      this.lastMessageCount = messageCount;
      return;
    }

    // 2. KHI CÓ TIN NHẮN MỚI (Nhận hoặc Gửi): Cuộn mượt mà (Smooth)
    if (messageCount !== this.lastMessageCount) {
      const oldCount = this.lastMessageCount;
      this.lastMessageCount = messageCount;

      if (messageCount > oldCount && this.shouldStickToBottom) {
        this.scrollToBottom(true); // Tham số true để bật Smooth scroll
      }
    }
  }

  onScroll(event: Event): void {
    if (this.isProgrammaticScroll) return; // Bỏ qua nếu hệ thống đang tự cuộn

    const element = event.target as HTMLElement;
    this.shouldStickToBottom = this.isNearBottom(element);
    const isAtTop = element.scrollTop <= 2;

    if (isAtTop && this.chatService.hasNextMessages() && !this.isPrependingOldMessages) {
      this.loadOlderMessagesAndKeepPosition(element);
    }
  }

  private loadOlderMessagesAndKeepPosition(element: HTMLElement): void {
    this.isPrependingOldMessages = true;
    const oldScrollHeight = element.scrollHeight;
    const oldScrollTop = element.scrollTop;

    const id = this.chatService.activeConversationId();
    const cursor = this.chatService.nextCursor();

    if (id !== null && cursor) {
      this.chatService.loadChatHistory(id, cursor);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const newScrollHeight = element.scrollHeight;
        this.isProgrammaticScroll = true;
        element.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;

        requestAnimationFrame(() => {
          this.isProgrammaticScroll = false;
          this.isPrependingOldMessages = false;
          this.shouldStickToBottom = false;
        });
      });
    });
  }

  /**
   * HÀM CUỘN CHUẨN XỊN: Hỗ trợ 2 chế độ Smooth và Instant
   */
  private scrollToBottom(smooth = false): void {
    const element = this.getScrollElement();
    if (!element) return;

    this.isProgrammaticScroll = true;

    // Dọn dẹp timeout cũ nếu đang cuộn lở dở
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

    // Lệnh cuộn chuẩn của trình duyệt
    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });

    // Khoá sự kiện người dùng cuộn tay (onScroll) trong lúc đang chạy animation mượt
    this.scrollTimeout = setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, smooth ? 300 : 50); // Mượt thì đợi 300ms, Thường thì đợi 50ms
  }

  private isNearBottom(element: HTMLElement): boolean {
    // Nếu cách đáy dưới 160px thì hệ thống hiểu là đang ở đáy
    return (element.scrollHeight - element.scrollTop - element.clientHeight) < 160;
  }

  private getScrollElement(): HTMLElement | null {
    return this.chatScrollContainer?.nativeElement ?? null;
  }

  setTab(tab: ChatContext): void {
    this.chatState.activeContext.set(tab);
    this.shouldStickToBottom = true;
    this.lastConversationKey = null;
    this.lastMessageCount = 0;
    
    if (tab === 'AI') {
      this.chatService.activeConversationId.set(-999);
    } else {
      this.chatService.activeConversationId.set(null);
    }
  }


  async handleSendMessage(payload: ChatSendPayload) {
    if (this.chatState.activeContext() === 'AI') {
      this.sendToAi(payload.content || '');
      return;
    }

    const currentId = this.chatService.activeConversationId();
    if (!currentId) return;

    // --- BẮT ĐẦU: KIỂM DUYỆT AI TRƯỚC KHI GỬI ---
    try {
      const moderationResult = await firstValueFrom(
        this.moderatorService.checkContent(payload.content || '', payload.files)
      );

      if (moderationResult.is_violation) {
        this.toast.error('Nội dung vi phạm', 'Tin nhắn hoặc hình ảnh của bạn chứa nội dung không phù hợp và đã bị chặn.');
        return; // Dừng việc gửi
      }
    } catch (error) {
      console.error('Lỗi khi kiểm duyệt nội dung:', error);
    }
    // --- KẾT THÚC: KIỂM DUYỆT AI ---

    // KỊCH BẢN 1: CÓ ĐÍNH KÈM FILE/HÌNH ẢNH
    if (payload.files && payload.files.length > 0) {
      try {
        // 1. Kích hoạt cỗ máy xử lý ngầm S3 bên trên, đợi nó trả về kết quả mảng objectKey
        const s3Results = await this.fileService.uploadBatchFiles(payload.files, ImageType.CHAT);

        // 2. Map trúng mảng objectKey vào đúng cấu trúc DTO gửi tin nhắn của ông
        const attachmentPayload = s3Results.map((s3, index) => ({
          fileUrl: s3.objectKey, // Đút objectKey vào cột fileUrl dưới DB để sau này dễ dọn rác
          fileType: payload.files![index].type
        }));

        // 3. Tiến hành gọi hàm COMMIT gửi tin nhắn chốt hạ lên Backend
        this.chatService.sendMessage(currentId, {
          content: payload.content || 'Đã gửi tập tin đính kèm',
          type: 'IMAGE', // Hoặc logic phân loại FILE dựa trên type của ông
          attachments: attachmentPayload
        });

      } catch (error) {
        console.error('❌ Lỗi quy trình upload S3 hoặc gửi tin:', error);
        alert('Không thể gửi tệp tin, vui lòng kiểm tra lại!');
      }

    } else {
      // KỊCH BẢN 2: TIN NHẮN CHỮ THƯỜNG KHÔNG CÓ FILE
      this.chatService.sendMessage(currentId, {
        content: payload.content,
        type: 'TEXT',
        attachments: []
      });
    }
    this.shouldStickToBottom = true;

    // Gọi ép cuộn mượt luôn (dự phòng trường hợp socket về chậm)
    setTimeout(() => this.scrollToBottom(true), 50);
  }
  viewBookingDetail(): void {
    // Logic của ông
  }
}