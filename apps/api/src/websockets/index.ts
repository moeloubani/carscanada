import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { conversationService } from '../services/conversation.service';
import prisma from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

interface OnlineUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

// Track online users
const onlineUsers = new Map<string, OnlineUser>();

// Track user's active conversations
const userConversations = new Map<string, Set<string>>();

// Track typing status
const typingUsers = new Map<string, Set<string>>(); // conversationId -> Set of userIds

export const initializeWebSocket = (io: SocketIOServer) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
        userId: string; 
        email: string;
      };
      
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.email = decoded.email;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Add user to online users
    onlineUsers.set(userId, {
      userId,
      socketId: socket.id,
      connectedAt: new Date()
    });

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Emit online status to user's contacts
    socket.broadcast.emit('user_online', { userId });

    // Get and join user's conversations
    try {
      const userConvs = await prisma.conversation.findMany({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        },
        select: { id: true }
      });

      const convIds = userConvs.map(c => c.id);
      userConversations.set(userId, new Set(convIds));

      // Join all conversation rooms
      for (const convId of convIds) {
        socket.join(`conversation:${convId}`);
      }

      // Send initial data to client
      socket.emit('initial_data', {
        conversations: convIds,
        onlineUsers: Array.from(onlineUsers.values()).map(u => u.userId)
      });

      // Get and send unread count
      const unreadCount = await conversationService.getUnreadCount(userId);
      socket.emit('unread_count', { count: unreadCount });

    } catch (error) {
      console.error('Error loading user conversations:', error);
    }

    // Handle joining a specific conversation
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        // Verify user has access to this conversation
        const canAccess = await conversationService.canAccessConversation(conversationId, userId);
        
        if (!canAccess) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        
        // Update user's conversation set
        const userConvs = userConversations.get(userId) || new Set();
        userConvs.add(conversationId);
        userConversations.set(userId, userConvs);

        socket.emit('joined_conversation', { conversationId });
        
        // Notify others in conversation that user joined
        socket.to(`conversation:${conversationId}`).emit('user_joined_conversation', {
          userId,
          conversationId
        });

      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving a conversation
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      
      const userConvs = userConversations.get(userId);
      if (userConvs) {
        userConvs.delete(conversationId);
      }

      // Clear typing status if user was typing
      const typingInConv = typingUsers.get(conversationId);
      if (typingInConv?.has(userId)) {
        typingInConv.delete(userId);
        socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
          userId,
          conversationId
        });
      }

      socket.to(`conversation:${conversationId}`).emit('user_left_conversation', {
        userId,
        conversationId
      });
    });

    // Handle typing indicators
    socket.on('typing', async (data: { conversationId: string }) => {
      const { conversationId } = data;
      
      try {
        // Verify user has access
        const canAccess = await conversationService.canAccessConversation(conversationId, userId);
        if (!canAccess) return;

        // Track typing status
        if (!typingUsers.has(conversationId)) {
          typingUsers.set(conversationId, new Set());
        }
        typingUsers.get(conversationId)!.add(userId);

        // Get user details for typing indicator
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true, avatarUrl: true }
        });

        // Broadcast to others in conversation
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          conversationId,
          user
        });

        // Auto-stop typing after 3 seconds
        setTimeout(() => {
          const typingInConv = typingUsers.get(conversationId);
          if (typingInConv?.has(userId)) {
            typingInConv.delete(userId);
            socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
              userId,
              conversationId
            });
          }
        }, 3000);

      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    // Handle stop typing
    socket.on('stop_typing', async (data: { conversationId: string }) => {
      const { conversationId } = data;
      
      const typingInConv = typingUsers.get(conversationId);
      if (typingInConv) {
        typingInConv.delete(userId);
      }

      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        userId,
        conversationId
      });
    });

    // Handle message read acknowledgments
    socket.on('mark_read', async (data: { conversationId: string }) => {
      const { conversationId } = data;
      
      try {
        const result = await conversationService.markMessagesAsRead(conversationId, userId);
        
        // Emit updated unread count to sender
        const unreadCount = await conversationService.getUnreadCount(userId);
        socket.emit('unread_count', { count: unreadCount });
        
        // Notify other user about read receipt
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { buyerId: true, sellerId: true }
        });
        
        if (conversation) {
          const otherUserId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
          io.to(`user:${otherUserId}`).emit('messages_read', {
            conversationId,
            readBy: userId,
            count: result.count
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle request for online status of specific users
    socket.on('check_online_status', (userIds: string[]) => {
      const onlineStatuses = userIds.map(id => ({
        userId: id,
        isOnline: onlineUsers.has(id)
      }));
      socket.emit('online_status_update', onlineStatuses);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${userId} (reason: ${reason})`);
      
      // Remove from online users
      onlineUsers.delete(userId);
      
      // Clear user's conversations
      userConversations.delete(userId);
      
      // Clear typing status from all conversations
      typingUsers.forEach((typingInConv, conversationId) => {
        if (typingInConv.has(userId)) {
          typingInConv.delete(userId);
          io.to(`conversation:${conversationId}`).emit('user_stop_typing', {
            userId,
            conversationId
          });
        }
      });
      
      // Notify others that user is offline
      socket.broadcast.emit('user_offline', { userId });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });
};

// Utility function to get online users
export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsers.keys());
};

// Utility function to check if user is online
export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

// Utility function to emit to specific user
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Utility function to emit to conversation
export const emitToConversation = (io: SocketIOServer, conversationId: string, event: string, data: any) => {
  io.to(`conversation:${conversationId}`).emit(event, data);
};