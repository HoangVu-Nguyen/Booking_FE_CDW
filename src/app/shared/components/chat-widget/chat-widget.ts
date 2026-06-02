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
import { ConversationSummaryResponse, SendMessageRequest } from '../../../core/models/response/chat.response';

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

  @ViewChild('chatScroll') private chatScrollContainer?: ElementRef<HTMLElement>;

  newMessage = signal<string>('');

  private lastConversationKey: string | null = null;
  private lastMessageCount = 0;

  private shouldStickToBottom = true;
  private isPrependingOldMessages = false;
  private isProgrammaticScroll = false;
  // Trạng thái đóng/mở của thẻ Booking
  isBookingExpanded = signal<boolean>(false);
  
  // Hàm toggle
  toggleBookingDetails(): void {
    this.isBookingExpanded.set(!this.isBookingExpanded());
  }

  // Lấy dữ liệu từ CHAT SERVICE
currentConversation = computed(() => {
    const context = this.chatState.activeContext();
    const id = this.chatService.activeConversationId();
    const auto = this.chatState.autoTargetHost(); // Lấy dữ liệu tạm từ trang Homestay

    // Ưu tiên 1: Lấy từ danh sách đã load được từ API (Dữ liệu THẬT)
    const realConv = this.chatService.conversations().find(c => c.id === id);
    if (realConv) {
      return realConv;
    }

    // Ưu tiên 2: Nếu API đang quay (chưa có Data thật), thì lấy dữ liệu tạm ra làm "Bình phong"
    if (context === 'HOST' && auto) {
      return {
        id: -1, // ID ảo vì chưa biết ID phòng thực sự
        type: 'HOST',
        targetName: auto.name,      // Map vào đúng trường của Interface
        targetAvatar: auto.avatar,  // Map vào đúng trường của Interface
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0,
        bookingStatus: null,
        propertyName: null
      } as ConversationSummaryResponse; // Ép kiểu cho chuẩn
    }

    // Nếu không có gì thì trả về null
    return null;
  });

  ngAfterViewChecked(): void {
    const element = this.getScrollElement();
    if (!element) return;

    const context = this.chatState.activeContext();
    const conversation = this.currentConversation();
    const conversationKey = `${context}-${conversation?.id ?? 'none'}`;

    // LẤY DỮ LIỆU TỪ CHAT SERVICE
    const messages = this.chatService.activeMessages();
    const messageCount = messages.length;

    if (conversationKey !== this.lastConversationKey) {
      this.lastConversationKey = conversationKey;
      this.lastMessageCount = messageCount;
      this.shouldStickToBottom = true;
      this.scrollToBottomAfterRender();
      return;
    }

    if (this.isPrependingOldMessages) {
      this.lastMessageCount = messageCount;
      return;
    }

    if (messageCount !== this.lastMessageCount) {
      const oldCount = this.lastMessageCount;
      this.lastMessageCount = messageCount;
      if (messageCount > oldCount && this.shouldStickToBottom) {
        this.scrollToBottomAfterRender();
      }
    }
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (this.isProgrammaticScroll) return;

    this.shouldStickToBottom = this.isNearBottom(element);
    const isAtTop = element.scrollTop <= 2;

    // LẤY TRẠNG THÁI TỪ CHAT SERVICE
    if (
      isAtTop &&
      this.chatService.hasNextMessages() &&
      // Giả sử bạn thêm signal này vào ChatService
      !this.isPrependingOldMessages
    ) {
      this.loadOlderMessagesAndKeepPosition(element);
    }
  }

  private loadOlderMessagesAndKeepPosition(element: HTMLElement): void {
    this.isPrependingOldMessages = true;
    const oldScrollHeight = element.scrollHeight;
    const oldScrollTop = element.scrollTop;

    // Gọi load từ ChatService
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

  private scrollToBottomAfterRender(): void {
    requestAnimationFrame(() => requestAnimationFrame(() => this.scrollToBottom()));
  }

  private scrollToBottom(): void {
    const element = this.getScrollElement();
    if (!element) return;
    this.isProgrammaticScroll = true;
    element.scrollTop = element.scrollHeight;
    requestAnimationFrame(() => this.isProgrammaticScroll = false);
  }

  private isNearBottom(element: HTMLElement): boolean {
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
    this.shouldStickToBottom = true;
  }

  viewBookingDetail(): void {
    
  }
}