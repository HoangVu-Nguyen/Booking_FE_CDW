import { Injectable, signal } from '@angular/core';

export type ChatContext = 'ADMIN' | 'HOST' | 'GROUP';

// Định nghĩa interface cho 1 cuộc hội thoại (Conversation)
export interface Conversation {
  id: number;
  type: ChatContext;
  name: string;
  avatar: string;
  lastMessage?: string;
  unreadCount: number;
}

@Injectable({ providedIn: 'root' })
export class ChatStateService {
  isOpen = signal<boolean>(false);
  activeContext = signal<ChatContext>('ADMIN'); 
  currentTargetId = signal<number | null>(0); // 0 = Admin mặc định

  // ==========================================
  // DỮ LIỆU ĐỘNG (Sẽ gọi API để nạp vào đây)
  // ==========================================
  
  // 1. Luôn có Admin
  adminConversation = signal<Conversation>({
    id: 0,
    type: 'ADMIN',
    name: 'Clyvasync Support',
    avatar: 'support_agent', // Dùng icon thay vì link ảnh
    unreadCount: 0
  });

  // 2. Danh sách Host (Gồm Host hiện tại đang xem và các Host cũ)
  hostConversations = signal<Conversation[]>([
    { id: 1, type: 'HOST', name: 'Cô Hai Đà Lạt', avatar: 'https://ui-avatars.com/api/?name=CH&background=173124&color=fff', lastMessage: 'Phòng bạn đã sẵn sàng', unreadCount: 0 },
    { id: 2, type: 'HOST', name: 'Vũng Tàu Villa', avatar: 'https://ui-avatars.com/api/?name=VT&background=173124&color=fff', lastMessage: 'Cảm ơn bạn đã đến', unreadCount: 0 }
  ]);

  // 3. Danh sách Nhóm
  groupConversations = signal<Conversation[]>([
    { id: 101, type: 'GROUP', name: 'Tour Đà Lạt 3N2Đ', avatar: 'DL', lastMessage: 'Mai 8h tập trung nhé', unreadCount: 1 }
  ]);

  // ==========================================
  // CÁC HÀM ĐIỀU KHIỂN TỪ BÊN NGOÀI VÀO
  // ==========================================
  
  toggleChat() {
    this.isOpen.update(v => !v);
  }

  openAdminSupport() {
    this.activeContext.set('ADMIN');
    this.currentTargetId.set(0);
    this.isOpen.set(true);
  }

  // Khi khách vào trang HomestayDetail, gọi hàm này để thêm Host đó vào danh sách (nếu chưa có) và mở chat
  openHostChat(hostId: number, hostName: string, hostAvatar: string) {
    // 1. Kiểm tra xem Host này đã có trong danh sách chat chưa
    const existing = this.hostConversations().find(c => c.id === hostId);
    
    // 2. Nếu chưa có, thêm mới vào đầu danh sách
    if (!existing) {
      const newHost: Conversation = {
        id: hostId, type: 'HOST', name: hostName, avatar: hostAvatar, unreadCount: 0
      };
      this.hostConversations.update(list => [newHost, ...list]);
    }

    // 3. Chuyển ngữ cảnh và mở chat
    this.activeContext.set('HOST');
    this.currentTargetId.set(hostId);
    this.isOpen.set(true);
  }

  openGroupChat(groupId: number) {
    this.activeContext.set('GROUP');
    this.currentTargetId.set(groupId);
    this.isOpen.set(true);
  }
}