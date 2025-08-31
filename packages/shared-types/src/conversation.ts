export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  listing?: any;
  buyer?: any;
  seller?: any;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender?: any;
}

export interface CreateMessageDto {
  conversationId: string;
  content: string;
}

export interface StartConversationDto {
  listingId: string;
  message: string;
}