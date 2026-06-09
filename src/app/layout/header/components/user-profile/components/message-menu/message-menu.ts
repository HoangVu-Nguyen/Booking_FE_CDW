import { Component, EventEmitter, Input, Output, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../../../../../core/services/chat/chat.service';
import { ChatStateService } from '../../../../../../core/services/chat/chat-state.service';

@Component({
  selector: 'app-message-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-menu.html',
  styleUrl: './message-menu.css',
})
export class MessageMenu implements OnInit {
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();

  public chatService = inject(ChatService);
  private chatState = inject(ChatStateService)
  private router = inject(Router);

  // Lấy tối đa 4 cuộc hội thoại mới nhất để hiển thị bản xem trước ở Dropdown Navbar
  quickConversations = computed(() => {
    return this.chatService.conversations().slice(0, 4);
  });

  // Đếm xem trong cụm hiển thị nhanh này có bao nhiêu phòng chưa đọc
  unreadInMenuCount = computed(() => {
    return this.chatService.conversations().filter(c => c.unreadCount > 0).length;
  });

  ngOnInit(): void {
    // Tự động kích hoạt tải danh sách hộp thư và tổng số chuông đỏ khi Header vừa load
    this.chatService.loadConversations('ALL', '');
    this.chatService.loadTotalUnreadCount();
  }

  // Hàm chuyển phòng chat và điều hướng thẳng người dùng vào trang Inbox chính
  openChatRoom(convId: number, targetUserId: number) {
    this.chatService.activeConversationId.set(convId);
    this.chatService.initHostConversation(targetUserId);
    
    // Điều hướng sang trang inbox lớn của ông
    this.chatState.toggleChat()
  }

  // Hàm tạo Avatar chữ cái nếu khách không có ảnh đại diện
  getInitials(name: string): string {
    if (!name) return 'GU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}