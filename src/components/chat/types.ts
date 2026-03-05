export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO string
  read: boolean;
  bookingId: string;
}

export interface ConversationBooking {
  id: string;
  serviceName: string;
  status: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  seekerId: string;
  providerId: string;
  otherUser: ChatUser;
  serviceName?: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  bookingStatus?: string;
  bookings: ConversationBooking[];
}
