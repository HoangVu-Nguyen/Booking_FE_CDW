import { ChatContext } from "../../services/chat/chat-state.service";
import { BookingDetails } from "./chat-detail.reponse";

export interface ConversationSummaryResponse {
  id: number;
  targetName: string;
  targetAvatar: string;
  lastMessageTime: string;
  bookingStatus: string;
  propertyName: string;
  booking?: BookingDetails[]
  type: ChatContext;
  name: string;
  avatar: string;
  
  lastMessage?: string;
  unreadCount: number;
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
  mine: boolean;
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