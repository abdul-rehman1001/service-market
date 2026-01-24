export interface ChatUser {
  id: string;
  name: string;
  avatar?: string; // optional avatar image
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string; // ISO string
}

export interface Conversation {
  id: string;
  user: ChatUser;
  lastMessage: string;
  unreadCount: number;
}
