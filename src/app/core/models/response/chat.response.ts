export interface ConversationSummaryResponse {
  id: number;
  type: 'ADMIN' | 'HOST' | 'GROUP';
  targetName: string;
  targetAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  bookingStatus: string;
  propertyName: string;
}

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
  isMine: boolean;
  attachments: AttachmentResponse[];
}

export interface SendMessageRequest {
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  attachments?: { fileUrl: string; fileType: string }[];
}