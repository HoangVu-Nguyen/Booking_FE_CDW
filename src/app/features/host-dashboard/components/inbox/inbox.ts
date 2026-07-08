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
import { ChatInput } from '../../../../shared/components/chat-input/chat-input';
import { ChatSendPayload } from '../../../../core/models/file/file.model';
import { FileService } from '../../../../core/services/file/file.service';
import { ImageType } from '../../../../core/enum/image-type.enum';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { ModeratorService } from '../../../../core/services/moderator/moderator.service';
@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatInput],
  templateUrl: './inbox.html',
  styleUrls: ['./inbox.css'],
})
export class Inbox implements OnInit, AfterViewChecked {
  searchQuery = signal<string>('');
  activeTab = signal<'ALL' | 'UNREAD' | 'STARRED'>('ALL');
  newMessage = signal<string>('');

  private websocketService = inject(WebsocketService);
  public chatService = inject(ChatService);
  public fileService = inject(FileService);
  private toast = inject(ToastService);
  private moderatorService = inject(ModeratorService);

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

  ngOnInit(): void { }

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


  async handleSendMessage(payload: ChatSendPayload) {
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
        const s3Results = await this.fileService.uploadBatchFiles(payload.files,ImageType.CHAT);

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

}