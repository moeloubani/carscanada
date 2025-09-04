'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  Search, 
  Send, 
  MoreVertical,
  Trash2,
  Archive,
  CheckCheck,
  Check,
  Clock,
  Car
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { messages as messagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import io from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  conversationId: string;
  createdAt: string;
  read: boolean;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    online?: boolean;
  }[];
  lastMessage: Message;
  unreadCount: number;
  listing?: {
    id: string;
    title: string;
    price: number;
    image?: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchConversations();
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    // Initialize Socket.io connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    socketRef.current.on('new_message', (message: Message) => {
      if (selectedConversation?.id === message.conversationId) {
        setMessages(prev => [...prev, message]);
      }
      // Update conversation list
      fetchConversations();
    });

    socketRef.current.on('typing_start', (data: { userId: string; conversationId: string }) => {
      if (selectedConversation?.id === data.conversationId && data.userId !== user?.id) {
        setTyping(true);
      }
    });

    socketRef.current.on('typing_stop', (data: { userId: string; conversationId: string }) => {
      if (selectedConversation?.id === data.conversationId && data.userId !== user?.id) {
        setTyping(false);
      }
    });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getConversations();
      
      // Mock data for demonstration
      const mockConversations: Conversation[] = [
        {
          id: '1',
          participants: [
            { id: '1', name: 'John Doe', avatar: '', online: true },
            { id: user?.id || '2', name: user?.name || 'Me', avatar: user?.avatar },
          ],
          lastMessage: {
            id: '1',
            content: 'Hi, is this car still available?',
            senderId: '1',
            recipientId: user?.id || '2',
            conversationId: '1',
            createdAt: new Date().toISOString(),
            read: false,
            sender: { id: '1', name: 'John Doe' },
          },
          unreadCount: 2,
          listing: {
            id: '1',
            title: '2020 Honda Civic',
            price: 25000,
          },
        },
      ];
      
      setConversations(mockConversations);
      if (mockConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(mockConversations[0]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load conversations',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await messagesApi.getConversation(conversationId);
      
      // Mock messages for demonstration
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hi, is this car still available?',
          senderId: '1',
          recipientId: user?.id || '2',
          conversationId,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          sender: { id: '1', name: 'John Doe' },
        },
        {
          id: '2',
          content: 'Yes, it\'s still available! Would you like to schedule a viewing?',
          senderId: user?.id || '2',
          recipientId: '1',
          conversationId,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          read: true,
          sender: { id: user?.id || '2', name: user?.name || 'Me' },
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load messages',
      });
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSending(true);
      
      const recipient = selectedConversation.participants.find(p => p.id !== user?.id);
      
      await messagesApi.send({
        recipientId: recipient?.id || '',
        listingId: selectedConversation.listing?.id,
        message: messageInput,
      });
      
      setMessageInput('');
      
      // Emit message through socket
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          conversationId: selectedConversation.id,
          content: messageInput,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message',
      });
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socketRef.current && selectedConversation) {
      socketRef.current.emit('typing_start', {
        conversationId: selectedConversation.id,
      });
      
      // Stop typing after 2 seconds
      setTimeout(() => {
        socketRef.current.emit('typing_stop', {
          conversationId: selectedConversation.id,
        });
      }, 2000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== user?.id);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conv.listing?.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex">
        <div className="w-96 border-r p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-96 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left hover:bg-muted/50 transition-colors mb-2",
                      isSelected && "bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback>
                            {otherParticipant?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {otherParticipant?.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{otherParticipant?.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {conversation.listing && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Car className="h-3 w-3" />
                            <span className="truncate">{conversation.listing.title}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.senderId === user?.id && 'You: '}
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="ml-2" variant="default">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Thread */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar} />
                <AvatarFallback>
                  {getOtherParticipant(selectedConversation)?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{getOtherParticipant(selectedConversation)?.name}</p>
                {selectedConversation.listing && (
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.listing.title} • ${selectedConversation.listing.price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2",
                        isOwnMessage 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        isOwnMessage ? "justify-end" : "justify-start"
                      )}>
                        <span className={cn(
                          "text-xs",
                          isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {format(new Date(message.createdAt), 'HH:mm')}
                        </span>
                        {isOwnMessage && (
                          message.read ? (
                            <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                          ) : (
                            <Check className="h-3 w-3 text-primary-foreground/70" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="resize-none"
                rows={1}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!messageInput.trim() || sending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}