import prisma from '../config/database';
import { Conversation, Message, User, Listing } from '@prisma/client';
import { AppError } from '../utils/errors';

export interface ConversationWithDetails extends Conversation {
  listing: Pick<Listing, 'id' | 'title' | 'price' | 'make' | 'model' | 'year'> & {
    images: { imageUrl: string }[];
  };
  buyer: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  seller: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  messages?: Message[];
  unreadCount?: number;
  lastMessage?: Message | null;
}

export interface PaginatedConversations {
  conversations: ConversationWithDetails[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginatedMessages {
  messages: (Message & { sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'> })[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export class ConversationService {
  /**
   * Get all conversations for a user with pagination
   */
  async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedConversations> {
    const offset = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              make: true,
              model: true,
              year: true,
              images: {
                where: { isPrimary: true },
                select: { imageUrl: true },
                take: 1
              }
            }
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.conversation.count({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      })
    ]);

    // Calculate unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false
          }
        });

        return {
          ...conv,
          unreadCount,
          lastMessage: conv.messages[0] || null
        };
      })
    );

    return {
      conversations: conversationsWithUnread,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get a single conversation with authorization check
   */
  async getConversation(conversationId: string, userId: string): Promise<ConversationWithDetails> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            make: true,
            model: true,
            year: true,
            images: {
              where: { isPrimary: true },
              select: { imageUrl: true },
              take: 1
            }
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Authorization check - only participants can access
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Not authorized to access this conversation', 403);
    }

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        isRead: false
      }
    });

    return {
      ...conversation,
      unreadCount
    };
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
    before?: Date
  ): Promise<PaginatedMessages> {
    // First verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true }
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Not authorized to access this conversation', 403);
    }

    const offset = (page - 1) * limit;
    const whereClause: any = { conversationId };
    
    if (before) {
      whereClause.createdAt = { lt: before };
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.message.count({ where: whereClause })
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + messages.length < total
    };
  }

  /**
   * Start a new conversation or return existing one
   */
  async startConversation(
    userId: string,
    listingId: string,
    initialMessage: string
  ): Promise<ConversationWithDetails> {
    // Get listing details
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!listing) {
      throw new AppError('Listing not found', 404);
    }

    if (listing.status !== 'ACTIVE') {
      throw new AppError('Cannot start conversation for inactive listing', 400);
    }

    if (listing.userId === userId) {
      throw new AppError('Cannot start conversation with yourself', 400);
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        listingId,
        buyerId: userId,
        sellerId: listing.userId
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            make: true,
            model: true,
            year: true,
            images: {
              where: { isPrimary: true },
              select: { imageUrl: true },
              take: 1
            }
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!conversation) {
      // Create new conversation with initial message
      conversation = await prisma.conversation.create({
        data: {
          listingId,
          buyerId: userId,
          sellerId: listing.userId,
          lastMessageAt: new Date(),
          messages: {
            create: {
              senderId: userId,
              content: initialMessage
            }
          }
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              make: true,
              model: true,
              year: true,
              images: {
                where: { isPrimary: true },
                select: { imageUrl: true },
                take: 1
              }
            }
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
    } else {
      // Add message to existing conversation
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: initialMessage
        }
      });

      // Update lastMessageAt
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() }
      });
    }

    return {
      ...conversation,
      lastMessage: conversation.messages?.[0] || null
    };
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    userId: string,
    content: string
  ): Promise<Message & { sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'> }> {
    // Verify user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true }
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Not authorized to send messages in this conversation', 403);
    }

    // Create message and update conversation
    const [message] = await Promise.all([
      prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        }
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      })
    ]);

    return message;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<{ count: number }> {
    // Verify user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true }
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Not authorized to access this conversation', 403);
    }

    // Mark all unread messages from other participant as read
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    return { count: result.count };
  }

  /**
   * Delete (soft delete) a conversation
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    // Verify user is participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true }
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Not authorized to delete this conversation', 403);
    }

    // For soft delete, we'll just delete all messages and the conversation
    // In a production app, you might want to add a deletedAt field instead
    await prisma.$transaction([
      prisma.message.deleteMany({
        where: { conversationId }
      }),
      prisma.conversation.delete({
        where: { id: conversationId }
      })
    ]);
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        senderId: { not: userId },
        isRead: false
      }
    });

    return count;
  }

  /**
   * Check if user can access conversation
   */
  async canAccessConversation(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true }
    });

    if (!conversation) return false;
    
    return conversation.buyerId === userId || conversation.sellerId === userId;
  }
}

export const conversationService = new ConversationService();