export interface Message {
  id: number;
  text: string;
  time: string;
  isMine: boolean;
}

export interface BookingDetails {
  code: string;
  property: string;
  propertyImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  paymentStatus: 'PAID' | 'PENDING';
}

export interface Conversation {
  id: number;
  guestName: string;
  guestAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'PRE_ARRIVAL' | 'IN_HOUSE' | 'POST_DEPARTURE' | 'CANCELLED';
  booking: BookingDetails;
  messages: Message[];
}
