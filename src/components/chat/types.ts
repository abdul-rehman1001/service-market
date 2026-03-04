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
}

export interface Conversation {
  id: string;           // Firestore doc id: booking_{bookingId}
  bookingId: string;
  otherUser: ChatUser;
  serviceName: string;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  bookingStatus: string;
}
