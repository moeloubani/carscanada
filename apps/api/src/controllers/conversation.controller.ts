import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { conversationService } from '../services/conversation.service';
import { notificationService } from '../services/notification.service';
import { io } from '../server';
import { AppError } from '../utils/errors';
import rateLimit from 'express-rate-limit';

// Message rate limiter - stricter than general API limit
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: 'Too many messages sent. Please wait before sending more.',
  standardHeaders: true,
  legacyHeaders: false,
});

export class ConversationController {
  /**
   * Get all conversations for authenticated user
   */
  async getUserConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await conversationService.getUserConversations(userId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single conversation details
   */
  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const conversationId = req.params.id;

      const conversation = await conversationService.getConversation(conversationId, userId);
      
      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const conversationId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before ? new Date(req.query.before as string) : undefined;

      const result = await conversationService.getConversationMessages(
        conversationId,
        userId,
        page,
        limit,
        before
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start a new conversation
   */
  async startConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const { listingId, message } = req.body;

      const conversation = await conversationService.startConversation(
        userId,
        listingId,
        message
      );

      // Emit real-time event to seller
      const recipientId = conversation.sellerId === userId ? conversation.buyerId : conversation.sellerId;
      io.to(`user:${recipientId}`).emit('new_conversation', {
        conversation,
        message: {
          content: message,
          senderId: userId,
          createdAt: new Date().toISOString()
        }
      });

      // Send email notification asynchronously
      if (conversation.messages && conversation.messages[0]) {
        notificationService.processNewMessage(conversation.messages[0].id).catch(console.error);
      }
      
      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send a message in an existing conversation
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const conversationId = req.params.id;
      const { content } = req.body;

      const message = await conversationService.sendMessage(
        conversationId,
        userId,
        content
      );

      // Get conversation details to determine recipient
      const conversation = await conversationService.getConversation(conversationId, userId);
      const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;

      // Emit real-time event to conversation room
      io.to(`conversation:${conversationId}`).emit('new_message', {
        message,
        conversationId
      });

      // Also emit to recipient's user room for notification
      io.to(`user:${recipientId}`).emit('message_notification', {
        conversationId,
        message,
        listing: conversation.listing
      });

      // Send email notification asynchronously
      notificationService.processNewMessage(message.id).catch(console.error);
      
      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const conversationId = req.params.id;

      const result = await conversationService.markMessagesAsRead(conversationId, userId);

      // Get conversation details to emit read receipt
      const conversation = await conversationService.getConversation(conversationId, userId);
      const otherUserId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;

      // Emit read receipt to other user
      io.to(`user:${otherUserId}`).emit('messages_read', {
        conversationId,
        readBy: userId,
        count: result.count
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const conversationId = req.params.id;

      await conversationService.deleteConversation(conversationId, userId);

      // Emit deletion event to conversation room
      io.to(`conversation:${conversationId}`).emit('conversation_deleted', {
        conversationId,
        deletedBy: userId
      });
      
      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const count = await conversationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle typing indicator
   */
  async handleTyping(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.id;
      const { isTyping } = req.body;

      // Verify user can access conversation
      const canAccess = await conversationService.canAccessConversation(conversationId, userId);
      if (!canAccess) {
        throw new AppError('Not authorized to access this conversation', 403);
      }

      // Emit typing event to conversation room
      io.to(`conversation:${conversationId}`).emit(isTyping ? 'user_typing' : 'user_stop_typing', {
        userId,
        conversationId
      });
      
      res.json({
        success: true
      });
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();