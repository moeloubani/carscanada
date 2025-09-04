/**
 * WebSocket Client Example for CarsCanada Real-time Messaging
 * 
 * This example shows how to connect and use the real-time messaging features
 * from a client application (React, React Native, etc.)
 */

import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

class CarsCanadaMessagingClient {
  private socket: Socket | null = null;
  private authToken: string;
  private serverUrl: string;
  private currentConversationId: string | null = null;

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
    this.authToken = '';
  }

  /**
   * Connect to the WebSocket server
   */
  connect(authToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authToken = authToken;

      this.socket = io(this.serverUrl, {
        auth: {
          token: authToken,
        },
        transports: ['websocket'],
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('Connected to messaging server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  /**
   * Set up all event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    // Initial data when connected
    this.socket.on('initial_data', (data) => {
      console.log('Initial data:', data);
      // data.conversations: Array of conversation IDs
      // data.onlineUsers: Array of online user IDs
    });

    // Unread count updates
    this.socket.on('unread_count', (data) => {
      console.log('Unread messages:', data.count);
      // Update UI badge/counter
    });

    // New conversation started
    this.socket.on('new_conversation', (data) => {
      console.log('New conversation:', data);
      // Add to conversations list
    });

    // New message received
    this.socket.on('new_message', (data) => {
      console.log('New message:', data.message);
      // Add to messages list if in current conversation
      // Otherwise show notification
    });

    // Message notification (for any conversation)
    this.socket.on('message_notification', (data) => {
      console.log('Message notification:', data);
      // Show push notification or update UI
    });

    // Typing indicators
    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data.userId, 'in', data.conversationId);
      // Show typing indicator in UI
    });

    this.socket.on('user_stop_typing', (data) => {
      console.log('User stopped typing:', data.userId);
      // Hide typing indicator
    });

    // Read receipts
    this.socket.on('messages_read', (data) => {
      console.log('Messages read by:', data.readBy, 'count:', data.count);
      // Update message read status in UI
    });

    // Online/offline status
    this.socket.on('user_online', (data) => {
      console.log('User online:', data.userId);
      // Update online status indicator
    });

    this.socket.on('user_offline', (data) => {
      console.log('User offline:', data.userId);
      // Update offline status indicator
    });

    // Online status updates
    this.socket.on('online_status_update', (statuses) => {
      console.log('Online statuses:', statuses);
      // Update UI with online/offline indicators
    });

    // Conversation events
    this.socket.on('joined_conversation', (data) => {
      console.log('Joined conversation:', data.conversationId);
    });

    this.socket.on('user_joined_conversation', (data) => {
      console.log('User joined conversation:', data.userId);
    });

    this.socket.on('user_left_conversation', (data) => {
      console.log('User left conversation:', data.userId);
    });

    this.socket.on('conversation_deleted', (data) => {
      console.log('Conversation deleted:', data.conversationId);
      // Remove from UI and navigate away if current
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      // Show error message to user
    });
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string) {
    if (!this.socket) {
      throw new Error('Not connected to server');
    }

    this.currentConversationId = conversationId;
    this.socket.emit('join_conversation', conversationId);
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string) {
    if (!this.socket) return;

    this.socket.emit('leave_conversation', conversationId);
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string) {
    if (!this.socket) return;

    this.socket.emit('typing', { conversationId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string) {
    if (!this.socket) return;

    this.socket.emit('stop_typing', { conversationId });
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string) {
    if (!this.socket) return;

    this.socket.emit('mark_read', { conversationId });
  }

  /**
   * Check online status of users
   */
  checkOnlineStatus(userIds: string[]) {
    if (!this.socket) return;

    this.socket.emit('check_online_status', userIds);
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Example usage in a React component
export const MessagingExample = () => {
  const client = new CarsCanadaMessagingClient();
  
  // Connect when component mounts
  useEffect(() => {
    const connectToMessaging = async () => {
      try {
        const authToken = localStorage.getItem('authToken'); // Get from your auth system
        if (authToken) {
          await client.connect(authToken);
          console.log('Connected to messaging');
        }
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    };

    connectToMessaging();

    // Cleanup on unmount
    return () => {
      client.disconnect();
    };
  }, []);

  // Join conversation when viewing
  const viewConversation = (conversationId: string) => {
    client.joinConversation(conversationId);
    client.markAsRead(conversationId); // Mark as read when viewing
  };

  // Handle typing
  let typingTimer: NodeJS.Timeout;
  const handleTyping = (conversationId: string) => {
    client.sendTyping(conversationId);
    
    // Auto-stop typing after 2 seconds of inactivity
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      client.stopTyping(conversationId);
    }, 2000);
  };

  // Send message via REST API
  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('Message sent:', data);
      
      // The WebSocket will receive the new_message event automatically
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Start new conversation
  const startConversation = async (listingId: string, message: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ listingId, message }),
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      console.log('Conversation started:', data);
      
      // Join the new conversation
      client.joinConversation(data.data.id);
      
      return data.data;
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };
};

// React Native specific example
export const ReactNativeMessagingExample = () => {
  // Same as above but with React Native specific adjustments
  // Use AsyncStorage instead of localStorage
  // Use react-native-push-notification for notifications
  // etc.
};

// Usage function for testing (not for production)
function useEffect(arg0: () => () => void, arg1: never[]) {
  throw new Error('Function not implemented - this is just an example');
}

export default CarsCanadaMessagingClient;