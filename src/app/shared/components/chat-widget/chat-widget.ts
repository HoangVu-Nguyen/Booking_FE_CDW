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
import { SendMessageRequest } from '../../../core/models/response/chat.response';

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

  // Lấy dữ liệu từ CHAT SERVICE
currentConversation = computed(() => {
  const context = this.chatState.activeContext();
  const id = this.chatService.activeConversationId();
  const auto = this.chatState.autoTargetHost(); // Lấy dữ liệu bạn vừa set
  console.log(auto)

  // Ưu tiên 1: Nếu đang ở tab HOST và có dữ liệu "tạm" từ trang Homestay, hiện luôn nó!
  if (context == 'HOST' && auto) {
    return {
      id: auto.id,
      name: auto.name, 
      avatar: auto.avatar,
      type: 'HOST'
    } as any;
  }

  // Ưu tiên 2: Lấy từ danh sách đã load được từ API
  return this.chatService.conversations().find(c => c.id === id) || null;
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