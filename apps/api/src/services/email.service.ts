import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email service not configured. Emails will not be sent.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service verification failed:', error);
      } else {
        console.log('Email service ready');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not configured. Would have sent:', {
        to: options.to,
        subject: options.subject,
      });
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@carscanada.ca',
        to: options.to,
        subject: options.subject,
        text: options.text || this.htmlToText(options.html),
        html: options.html,
      });

      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendPaymentConfirmation(
    email: string,
    data: {
      userName: string;
      listingTitle: string;
      packageName: string;
      amount: number;
      currency: string;
      featuredUntil: Date;
      transactionId: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmation</h1>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Great news! Your payment has been successfully processed and your listing is now featured on CarsCanada.</p>
            
            <div class="details">
              <h3>Transaction Details</h3>
              <div class="detail-row">
                <span><strong>Transaction ID:</strong></span>
                <span>${data.transactionId}</span>
              </div>
              <div class="detail-row">
                <span><strong>Listing:</strong></span>
                <span>${data.listingTitle}</span>
              </div>
              <div class="detail-row">
                <span><strong>Package:</strong></span>
                <span>${data.packageName}</span>
              </div>
              <div class="detail-row">
                <span><strong>Amount:</strong></span>
                <span>$${data.amount.toFixed(2)} ${data.currency}</span>
              </div>
              <div class="detail-row">
                <span><strong>Featured Until:</strong></span>
                <span>${new Date(data.featuredUntil).toLocaleDateString()}</span>
              </div>
            </div>
            
            <p>Your listing will now receive:</p>
            <ul>
              <li>Featured badge and priority placement</li>
              <li>Increased visibility in search results</li>
              <li>Highlighting on category pages</li>
              <li>Enhanced exposure to potential buyers</li>
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/my-listings" class="button">View Your Listing</a>
            </center>
            
            <p>If you have any questions about your featured listing, please don't hesitate to contact our support team.</p>
            
            <p>Thank you for choosing CarsCanada!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} CarsCanada. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Payment Confirmation - Your Listing is Now Featured!',
      html,
    });
  }

  async sendPaymentFailed(
    email: string,
    data: {
      userName: string;
      listingTitle: string;
      packageName: string;
      amount: number;
      reason?: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .alert { background-color: #fee; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <div class="alert">
              <p><strong>We were unable to process your payment for the following listing:</strong></p>
              <p>${data.listingTitle}</p>
              <p>Package: ${data.packageName} - $${data.amount.toFixed(2)} CAD</p>
              ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
            </div>
            
            <p>Don't worry - no charges have been made to your account.</p>
            
            <p>You can try again by:</p>
            <ul>
              <li>Checking your payment information</li>
              <li>Ensuring sufficient funds are available</li>
              <li>Using a different payment method</li>
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/my-listings" class="button">Try Again</a>
            </center>
            
            <p>If you continue to experience issues, please contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} CarsCanada. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Payment Failed - Action Required',
      html,
    });
  }

  async sendRefundConfirmation(
    email: string,
    data: {
      userName: string;
      listingTitle: string;
      amount: number;
      currency: string;
      transactionId: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .details { background-color: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Refund Processed</h1>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Your refund has been successfully processed.</p>
            
            <div class="details">
              <h3>Refund Details</h3>
              <div class="detail-row">
                <span><strong>Transaction ID:</strong></span>
                <span>${data.transactionId}</span>
              </div>
              <div class="detail-row">
                <span><strong>Listing:</strong></span>
                <span>${data.listingTitle}</span>
              </div>
              <div class="detail-row">
                <span><strong>Refund Amount:</strong></span>
                <span>$${data.amount.toFixed(2)} ${data.currency}</span>
              </div>
            </div>
            
            <p>The refund should appear in your account within 5-10 business days, depending on your bank.</p>
            
            <p>If you have any questions about this refund, please contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} CarsCanada. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Refund Processed Successfully',
      html,
    });
  }

  async sendSearchAlertEmail(
    email: string,
    alertName: string,
    listings: any[]
  ): Promise<boolean> {
    const listingCards = listings.slice(0, 10).map(listing => {
      const primaryImage = listing.images?.[0]?.imageUrl || '/placeholder-car.jpg';
      return `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <div style="display: flex; gap: 15px;">
            <img src="${primaryImage}" alt="${listing.title}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px;">
                <a href="${process.env.CLIENT_URL}/listings/${listing.id}" style="color: #1f2937; text-decoration: none;">
                  ${listing.year} ${listing.make} ${listing.model}
                </a>
              </h3>
              <p style="margin: 5px 0; color: #10b981; font-size: 18px; font-weight: bold;">
                $${Number(listing.price).toLocaleString()}
              </p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">
                ${listing.mileageKm.toLocaleString()} km • ${listing.transmission} • ${listing.fuelType}
              </p>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">
                📍 ${listing.city}, ${listing.province}
              </p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Matches for Your Search Alert</h1>
          </div>
          
          <div class="content">
            <p>Hi there,</p>
            
            <p>We found <strong>${listings.length}</strong> new listing${listings.length !== 1 ? 's' : ''} 
            matching your search alert "<strong>${alertName}</strong>".</p>
            
            <h2 style="margin-top: 30px; margin-bottom: 20px;">New Listings</h2>
            
            ${listingCards}
            
            ${listings.length > 10 ? `
              <p style="text-align: center; margin-top: 20px;">
                <a href="${process.env.CLIENT_URL}/search" class="cta-button">
                  View All ${listings.length} Listings
                </a>
              </p>
            ` : ''}
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="font-size: 14px; color: #666;">
              To manage your search alerts or unsubscribe, visit your 
              <a href="${process.env.CLIENT_URL}/dashboard/alerts">account settings</a>.
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated email based on your search preferences.</p>
            <p>© ${new Date().getFullYear()} CarsCanada. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `${listings.length} New Match${listings.length !== 1 ? 'es' : ''} - ${alertName}`,
      html,
    });
  }

  // Helper to convert HTML to plain text
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export default new EmailService();
export { EmailService };