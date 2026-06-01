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

import {
  ChatContext,
  ChatStateService
} from '../../../core/services/chat/chat-state.service';

import {
  SendMessageRequest
} from '../../../core/models/response/chat.response';

import { ChatService } from '../../../core/services/chat/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css']
})
export class ChatWidget implements AfterViewChecked {
  public chatState = inject(ChatStateService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  @ViewChild('chatScroll') private chatScrollContainer?: ElementRef<HTMLElement>;

  newMessage = signal<string>('');

  private lastConversationKey: string | null = null;
  private lastMessageCount = 0;

  private shouldStickToBottom = true;
  private isPrependingOldMessages = false;
  private isProgrammaticScroll = false;

  currentConversation = computed(() => {
    const context = this.chatState.activeContext();
    const id = this.chatState.currentTargetId();

    if (context === 'ADMIN') return this.chatState.adminConversation();
    if (context === 'HOST') return this.chatState.hostConversations().find(c => c.id === id);
    if (context === 'GROUP') return this.chatState.groupConversations().find(c => c.id === id);

    return null;
  });

  ngAfterViewChecked(): void {
    const element = this.getScrollElement();
    if (!element) return;

    const context = this.chatState.activeContext();
    const conversation = this.currentConversation();
    const conversationKey = `${context}-${conversation?.id ?? 'none'}`;

    const messages = this.chatState.activeMessages();
    const messageCount = messages.length;

    // 1. Khi đổi phòng chat thì kéo xuống cuối 1 lần
    if (conversationKey !== this.lastConversationKey) {
      this.lastConversationKey = conversationKey;
      this.lastMessageCount = messageCount;
      this.shouldStickToBottom = true;

      this.scrollToBottomAfterRender();
      return;
    }

    // 2. Khi đang prepend tin nhắn cũ thì tuyệt đối không auto scroll xuống đáy
    if (this.isPrependingOldMessages) {
      this.lastMessageCount = messageCount;
      return;
    }

    // 3. Chỉ auto scroll khi có message mới và user đang ở gần đáy
    if (messageCount !== this.lastMessageCount) {
      const oldCount = this.lastMessageCount;
      this.lastMessageCount = messageCount;

      const hasNewMessage = messageCount > oldCount;

      if (hasNewMessage && this.shouldStickToBottom) {
        this.scrollToBottomAfterRender();
      }
    }
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;

    if (this.isProgrammaticScroll) return;

    this.shouldStickToBottom = this.isNearBottom(element);

    const isAtTop = element.scrollTop <= 2;

    if (
      isAtTop &&
      this.chatState.hasNextMessages() &&
      !this.chatState.isLoadingMessages() &&
      !this.isPrependingOldMessages
    ) {
      this.loadOlderMessagesAndKeepPosition(element);
    }
  }

  private loadOlderMessagesAndKeepPosition(element: HTMLElement): void {
    this.isPrependingOldMessages = true;

    const oldScrollHeight = element.scrollHeight;
    const oldScrollTop = element.scrollTop;

    this.chatState.loadMoreOldMessages();

    /**
     * Chờ Angular render xong danh sách message cũ.
     * Dùng 2 lần requestAnimationFrame để chắc chắn DOM đã cập nhật chiều cao.
     */
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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });
    });
  }

  private scrollToBottom(): void {
    const element = this.getScrollElement();
    if (!element) return;

    this.isProgrammaticScroll = true;

    element.scrollTop = element.scrollHeight;

    requestAnimationFrame(() => {
      this.isProgrammaticScroll = false;
    });
  }

  private isNearBottom(element: HTMLElement): boolean {
    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    return distanceToBottom < 160;
  }

  private getScrollElement(): HTMLElement | null {
    return this.chatScrollContainer?.nativeElement ?? null;
  }

  setTab(tab: ChatContext): void {
    this.chatState.activeContext.set(tab);

    this.shouldStickToBottom = true;
    this.lastConversationKey = null;
    this.lastMessageCount = 0;

    if (tab === 'HOST') {
      const autoHost = this.autoTargetHost();
      const hosts = this.chatState.hostConversations();

      if (autoHost && hosts.some(h => h.id === autoHost.id)) {
        this.chatState.currentTargetId.set(autoHost.id);
      } else {
        this.chatState.currentTargetId.set(hosts.length > 0 ? hosts[0].id : null);
      }
    } else if (tab === 'GROUP') {
      const groups = this.chatState.groupConversations();
      this.chatState.currentTargetId.set(groups.length > 0 ? groups[0].id : null);
    } else if (tab === 'ADMIN') {
      this.chatState.currentTargetId.set(0);
    }
  }

  private autoTargetHost() {
    return this.chatState.autoTargetHost();
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    if (!text) return;

    const id = this.chatState.currentTargetId()
    if (!id) return;

    const request: SendMessageRequest = {
      content: text,
      type: 'TEXT',
      attachments: []
    };

    this.shouldStickToBottom = true;
    console.log(id)

    this.chatService.sendMessage(id, request);

    this.newMessage.set('');

    this.scrollToBottomAfterRender();
  }

  viewBookingDetail(): void {
    const booking = this.currentConversation()?.booking;

    if (booking?.code) {
      this.chatState.isOpen.set(false);
      this.router.navigate(['/booking', booking.code]);
    }
  }
}