import { 
  Component, 
  computed, 
  inject, 
  OnInit, 
  signal, 
  effect, 
  ViewChild, 
  ElementRef, 
  AfterViewChecked 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../../../core/services/realtime/websocket.service';
import { ChatService } from '../../../../core/services/chat/chat.service';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox.html',
  styleUrls: ['./inbox.css'],
})
export class Inbox implements OnInit, AfterViewChecked {
  searchQuery = signal<string>('');
  activeTab = signal<'ALL' | 'UNREAD' | 'STARRED'>('ALL');
  newMessage = signal<string>('');

  private websocketService = inject(WebsocketService);
  public chatService = inject(ChatService);

  // --- BỘ MÁY SCROLL ---
  @ViewChild('chatScroll') private chatScrollContainer?: ElementRef<HTMLElement>;
  
  private lastConversationKey: number | null = null;
  private lastMessageCount = 0;
  private shouldStickToBottom = true;
  private isPrependingOldMessages = false;
  private isProgrammaticScroll = false;
  private scrollTimeout: any;

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      const query = this.searchQuery();
      this.chatService.loadConversations(tab, query);
    });
  }

  ngOnInit(): void {}

  filteredConversations = computed(() => {
    return this.chatService.conversations();
  });

  activeConvSummary = computed(() => 
    this.chatService.conversations().find(c => c.id === this.chatService.activeConversationId())
  );

  // ==========================================
  // LOGIC CUỘN (SCROLL ENGINE)
  // ==========================================
  ngAfterViewChecked(): void {
    const element = this.getScrollElement();
    if (!element) return;

    const currentId = this.chatService.activeConversationId();
    const messages = this.chatService.activeMessages();
    const messageCount = messages.length;

    // 1. Khi đổi người chat -> Cuộn đáy tức thì
    if (currentId !== this.lastConversationKey) {
      this.lastConversationKey = currentId;
      this.lastMessageCount = messageCount;
      this.shouldStickToBottom = true;
      this.scrollToBottom(false);
      return;
    }

    if (this.isPrependingOldMessages) {
      this.lastMessageCount = messageCount;
      return;
    }

    // 2. Khi có tin nhắn mới -> Cuộn mượt
    if (messageCount !== this.lastMessageCount) {
      const oldCount = this.lastMessageCount;
      this.lastMessageCount = messageCount;
      
      if (messageCount > oldCount && this.shouldStickToBottom) {
        this.scrollToBottom(true);
      }
    }
  }

  onScroll(event: Event): void {
    if (this.isProgrammaticScroll) return;

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

  private scrollToBottom(smooth = false): void {
    const element = this.getScrollElement();
    if (!element) return;

    this.isProgrammaticScroll = true;
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });

    this.scrollTimeout = setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, smooth ? 300 : 50);
  }

  private isNearBottom(element: HTMLElement): boolean {
    return (element.scrollHeight - element.scrollTop - element.clientHeight) < 160;
  }

  private getScrollElement(): HTMLElement | null {
    return this.chatScrollContainer?.nativeElement ?? null;
  }

  // ==========================================
  // THAO TÁC NGƯỜI DÙNG
  // ==========================================
  selectConversation(convId: number, targetUserId: number) {
    this.chatService.activeConversationId.set(convId);
    this.websocketService.subscribeToChatRoom(convId);
    
    // Đánh dấu lại để khi load xong nó tự cuộn xuống đáy
    this.shouldStickToBottom = true; 

    this.chatService.initHostConversation(targetUserId);

    this.chatService.conversations.update(list => list.map(c => 
      c.id === convId ? { ...c, unreadCount: 0 } : c
    ));
  }

  sendMessage() {
    const text = this.newMessage().trim();
    const currentId = this.chatService.activeConversationId();
    
    if (!text || !currentId) return;

    this.chatService.sendMessage(currentId, { content: text, type: 'TEXT' });
    this.newMessage.set('');
    
    // Gửi xong ép cuộn xuống đáy mượt mà
    this.shouldStickToBottom = true;
    setTimeout(() => this.scrollToBottom(true), 50);
  }
}