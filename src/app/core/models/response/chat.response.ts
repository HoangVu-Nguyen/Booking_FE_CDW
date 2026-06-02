import { ChatContext } from "../../services/chat/chat-state.service";

export interface ConversationSummaryResponse {
  id: number;
  type: ChatContext;       // 'HOST' | 'ADMIN' | 'GROUP'
  
  // Thông tin người chat cùng
  targetName: string;      // Thay vì dùng 'name' và 'targetName' lẫn lộn
  targetAvatar: string;    // Thay vì dùng 'avatar' và 'targetAvatar' lẫn lộn
  targetUserId:number;
  
  // Tin nhắn xem trước
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;

  // Dành cho UI hiển thị tag nhỏ dưới tên (nếu có)
  propertyName: string | null;
  bookingStatus: string | null;
}

// ==========================================
// 2. DỮ LIỆU TIN NHẮN (Khung chat chính)
// ==========================================
export interface AttachmentResponse {
  id: number;
  fileUrl: string;
  fileType: string;
}

export interface MessageResponse {
  id: number;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  time: string;
  mine: boolean; // Lưu ý: Trong HTML nhớ dùng msg.mine nhé
  attachments: AttachmentResponse[];
}

export interface SendMessageRequest {
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  attachments?: { fileUrl: string; fileType: string }[];
}

export interface ChatHistoryResponse {
  messages: MessageResponse[];
  nextCursor: number | null;
  hasNext: boolean;
}