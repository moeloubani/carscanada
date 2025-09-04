import nodemailer from 'nodemailer';
import prisma from '../config/database';
import { User, Message, Conversation, Listing } from '@prisma/client';

interface MessageNotificationData {
  recipient: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
  sender: Pick<User, 'firstName' | 'lastName'>;
  message: Message;
  listing: Pick<Listing, 'title' | 'make' | 'model' | 'year'>;
  conversationId: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class NotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly isEmailEnabled: boolean;
  private readonly emailFrom: string;
  private readonly frontendUrl: string;

  constructor() {
    this.isEmailEnabled = process.env.SMTP_HOST ? true : false;
    this.emailFrom = process.env.EMAIL_FROM || 'noreply@carscanada.ca';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (this.isEmailEnabled) {
      this.initializeTransporter();
    }
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      // Verify transporter configuration
      this.transporter.verify((error) => {
        if (error) {
          console.error('Email transporter verification failed:', error);
          this.transporter = null;
        } else {
          console.log('Email service initialized successfully');
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      console.log('Email service not configured, skipping email:', options.subject);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.emailFrom,
        ...options,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw - we don't want email failures to break the app
    }
  }

  /**
   * Send new message notification email
   */
  async sendNewMessageNotification(data: MessageNotificationData): Promise<void> {
    const conversationUrl = `${this.frontendUrl}/conversations/${data.conversationId}`;
    
    const subject = `New message from ${data.sender.firstName} about ${data.listing.make} ${data.listing.model}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .message-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 3px solid #0066cc; }
            .listing-info { background-color: #e9f2ff; padding: 10px; margin: 10px 0; border-radius: 3px; }
            .button { display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CarsCanada</h1>
              <p>You have a new message!</p>
            </div>
            <div class="content">
              <p>Hi ${data.recipient.firstName},</p>
              
              <p><strong>${data.sender.firstName} ${data.sender.lastName}</strong> sent you a message about:</p>
              
              <div class="listing-info">
                <strong>${data.listing.year} ${data.listing.make} ${data.listing.model}</strong><br>
                ${data.listing.title}
              </div>
              
              <div class="message-box">
                <p><strong>Message:</strong></p>
                <p>${this.escapeHtml(data.message.content)}</p>
              </div>
              
              <a href="${conversationUrl}" class="button">Reply to Message</a>
              
              <div class="footer">
                <p>This email was sent to ${data.recipient.email} because you have an account on CarsCanada.</p>
                <p>To stop receiving these notifications, update your preferences in your account settings.</p>
                <p>&copy; ${new Date().getFullYear()} CarsCanada. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      New message from ${data.sender.firstName} ${data.sender.lastName}
      
      About: ${data.listing.year} ${data.listing.make} ${data.listing.model}
      ${data.listing.title}
      
      Message:
      ${data.message.content}
      
      Reply at: ${conversationUrl}
      
      ---
      This email was sent to ${data.recipient.email} because you have an account on CarsCanada.
    `;

    await this.sendEmail({
      to: data.recipient.email,
      subject,
      html,
      text,
    });
  }

  /**
   * Process new message and send notifications if needed
   */
  async processNewMessage(messageId: string): Promise<void> {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          conversation: {
            include: {
              buyer: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              seller: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              listing: {
                select: {
                  title: true,
                  make: true,
                  model: true,
                  year: true,
                },
              },
            },
          },
        },
      });

      if (!message) return;

      // Determine recipient
      const recipient = message.conversation.buyerId === message.senderId
        ? message.conversation.seller
        : message.conversation.buyer;

      // Check if recipient is online (this would need Redis or similar for production)
      // For now, we'll always send email notifications
      // In production, you'd check if user has an active socket connection

      await this.sendNewMessageNotification({
        recipient,
        sender: message.sender,
        message,
        listing: message.conversation.listing,
        conversationId: message.conversationId,
      });

      // Here you could also send push notifications if implemented
      // await this.sendPushNotification(recipient.id, ...);
    } catch (error) {
      console.error('Failed to process message notification:', error);
    }
  }

  /**
   * Send conversation summary email (daily digest)
   */
  async sendDailyConversationSummary(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) return;

    // Get unread messages from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const unreadMessages = await prisma.message.findMany({
      where: {
        conversation: {
          OR: [
            { buyerId: userId },
            { sellerId: userId },
          ],
        },
        senderId: { not: userId },
        isRead: false,
        createdAt: { gte: yesterday },
      },
      include: {
        conversation: {
          include: {
            listing: {
              select: {
                title: true,
                make: true,
                model: true,
                year: true,
              },
            },
          },
        },
        sender: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (unreadMessages.length === 0) return;

    const subject = `You have ${unreadMessages.length} unread messages on CarsCanada`;

    const conversationGroups = this.groupMessagesByConversation(unreadMessages);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .conversation { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Daily Message Summary</h1>
              <p>${unreadMessages.length} unread messages</p>
            </div>
            <div class="content">
              <p>Hi ${user.firstName},</p>
              <p>Here's a summary of your unread messages:</p>
              
              ${Object.entries(conversationGroups).map(([convId, messages]) => `
                <div class="conversation">
                  <h3>${messages[0].conversation.listing.year} ${messages[0].conversation.listing.make} ${messages[0].conversation.listing.model}</h3>
                  <p><strong>${messages.length} new messages</strong> from ${messages[0].sender.firstName} ${messages[0].sender.lastName}</p>
                  <p>Latest: "${this.truncateText(messages[0].content, 100)}"</p>
                  <a href="${this.frontendUrl}/conversations/${convId}">View Conversation →</a>
                </div>
              `).join('')}
              
              <a href="${this.frontendUrl}/conversations" class="button">View All Conversations</a>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  /**
   * Helper to group messages by conversation
   */
  private groupMessagesByConversation(messages: any[]): Record<string, any[]> {
    return messages.reduce((acc, message) => {
      if (!acc[message.conversationId]) {
        acc[message.conversationId] = [];
      }
      acc[message.conversationId].push(message);
      return acc;
    }, {});
  }

  /**
   * Helper to escape HTML
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  /**
   * Helper to truncate text
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Prepare push notification data (for future implementation)
   */
  preparePushNotification(data: MessageNotificationData) {
    return {
      title: `New message from ${data.sender.firstName}`,
      body: this.truncateText(data.message.content, 100),
      data: {
        conversationId: data.conversationId,
        messageId: data.message.id,
        type: 'new_message',
      },
      badge: 1,
    };
  }
}

export const notificationService = new NotificationService();