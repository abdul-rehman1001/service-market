export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  user: ChatUser;
  lastMessage: string;
  unreadCount: number;
}
