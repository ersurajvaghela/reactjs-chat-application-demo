export interface User {
  userId: number;
  username: string;
  email?: string;
  createdAt?: Date;
}

export interface ChatRoom {
  roomId: number;
  roomName: string;
  createdAt: Date;
  createdBy: User;
  
  memberships?: RoomMembership[];
}

export interface RoomMembership {
  userId: number;
  roomId: number;
  joinedAt: Date;
  user: User;
}

export interface Message {
  messageId: number;
  roomId: number;
  messageText: string;
  sentAt: Date;
  editedAt?: Date;
  sender: User;
}

export interface PrivateMessage {
  messageId: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  sentAt: Date;
  sender: User;
  receiver: User;
}

export interface TypingUser {
  userId: number;
  username: string;
  roomId?: number;
  isTyping: boolean;
}