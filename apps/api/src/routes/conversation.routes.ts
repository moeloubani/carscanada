import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { conversationController, messageLimiter } from '../controllers/conversation.controller';
import {
  startConversationValidator,
  sendMessageValidator,
  conversationIdValidator,
  paginationValidator,
  messagesPaginationValidator,
} from '../validators/conversation.validator';

const router = Router();

// All conversation routes require authentication
router.use(authenticate);

// Get user's conversations with pagination
router.get(
  '/',
  paginationValidator,
  conversationController.getUserConversations
);

// Get unread message count
router.get(
  '/unread-count',
  conversationController.getUnreadCount
);

// Get single conversation details
router.get(
  '/:id',
  conversationIdValidator,
  conversationController.getConversation
);

// Get conversation messages with pagination
router.get(
  '/:id/messages',
  messagesPaginationValidator,
  conversationController.getConversationMessages
);

// Start new conversation
router.post(
  '/',
  messageLimiter,
  startConversationValidator,
  conversationController.startConversation
);

// Send message in existing conversation
router.post(
  '/:id/messages',
  messageLimiter,
  sendMessageValidator,
  conversationController.sendMessage
);

// Mark messages as read
router.put(
  '/:id/read',
  conversationIdValidator,
  conversationController.markMessagesAsRead
);

// Handle typing indicator
router.post(
  '/:id/typing',
  conversationIdValidator,
  conversationController.handleTyping
);

// Delete conversation (soft delete)
router.delete(
  '/:id',
  conversationIdValidator,
  conversationController.deleteConversation
);

export default router;