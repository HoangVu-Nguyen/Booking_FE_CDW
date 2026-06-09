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

import { ChatContext, ChatStateService } from '../../../core/services/chat/chat-state.service';
import { ChatService } from '../../../core/services/chat/chat.service';
import { ConversationSummaryResponse } from '../../../core/models/response/chat.response';
import { WebsocketService } from '../../../core/services/realtime/websocket.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  ngAfterViewChecked(): void {
    const element = this.getScrollElement();
    if (!element) return;

    const context = this.chatState.activeContext();
    const conversation = this.currentConversation();
    const conversationKey = `${context}-${conversation?.id ?? 'none'}`;

    const messages = this.chatService.activeMessages();
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
    this.chatService.activeConversationId.set(null);
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    if (!text) return;

    const id = this.chatService.activeConversationId();
    if (!id) return;

    this.chatService.sendMessage(id, {
      content: text,
      type: 'TEXT',
      attachments: []
    });
    
    this.newMessage.set('');
    
    // Ép hệ thống nhớ là phải bám đáy sau khi gửi
    this.shouldStickToBottom = true; 
    
    // Gọi ép cuộn mượt luôn (dự phòng trường hợp socket về chậm)
    setTimeout(() => this.scrollToBottom(true), 50);
  }

  viewBookingDetail(): void {
    // Logic của ông
  }
}