import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import paymentService from '../services/payment.service';
import {
  createCheckoutSchema,
  getPackagesSchema,
  transactionQuerySchema,
  createPackageSchema,
  updatePackageSchema,
} from '../validators/payment.validator';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    isDealer?: boolean;
  };
}

export class PaymentController {
  // Get all available packages
  async getPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getPackagesSchema.parse(req.query);
      const packages = await paymentService.getPackages(query.isActive);

      res.json({
        success: true,
        data: packages,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  // Get single package details
  async getPackageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid package ID format',
        });
        return;
      }

      const pkg = await paymentService.getPackageById(id);

      res.json({
        success: true,
        data: pkg,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Package not found') {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      next(error);
    }
  }

  // Create checkout session
  async createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const data = createCheckoutSchema.parse(req.body);
      const result = await paymentService.createCheckoutSession(req.user.userId, data);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }

      if (error instanceof Error) {
        const errorMessages = [
          'Listing not found or does not belong to user',
          'Listing is already featured',
          'Package not found',
        ];

        if (errorMessages.includes(error.message)) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      next(error);
    }
  }

  // Handle Stripe webhook
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        res.status(400).json({
          success: false,
          message: 'Missing stripe signature',
        });
        return;
      }

      // Get raw body for signature verification
      const rawBody = (req as any).rawBody || req.body;

      // Verify webhook signature and get event
      const event = paymentService.verifyWebhookSignature(rawBody, signature);

      // Process the event
      await paymentService.handleWebhookEvent(event);

      // Respond immediately to Stripe
      res.json({ received: true });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Webhook error:', error.message);
        
        // For webhook errors, always return 400 to Stripe
        res.status(400).json({
          success: false,
          message: `Webhook Error: ${error.message}`,
        });
        return;
      }
      next(error);
    }
  }

  // Get user's transactions
  async getUserTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const query = transactionQuerySchema.parse(req.query);
      const result = await paymentService.getUserTransactions(
        req.user.userId,
        query.page,
        query.limit,
        query.status
      );

      res.json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  // Get single transaction details
  async getTransactionById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;

      if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid transaction ID format',
        });
        return;
      }

      const transaction = await paymentService.getTransactionById(id, req.user.userId);

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Transaction not found') {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      next(error);
    }
  }

  // Admin: Create new package
  async createPackage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Add admin check middleware
      // if (!req.user?.isAdmin) {
      //   res.status(403).json({
      //     success: false,
      //     message: 'Admin access required',
      //   });
      //   return;
      // }

      const data = createPackageSchema.parse(req.body);
      const pkg = await paymentService.createPackage(data);

      res.status(201).json({
        success: true,
        data: pkg,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  // Admin: Update package
  async updatePackage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Add admin check middleware
      // if (!req.user?.isAdmin) {
      //   res.status(403).json({
      //     success: false,
      //     message: 'Admin access required',
      //   });
      //   return;
      // }

      const { id } = req.params;

      if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid package ID format',
        });
        return;
      }

      const data = updatePackageSchema.parse(req.body);
      const pkg = await paymentService.updatePackage(id, data);

      res.json({
        success: true,
        data: pkg,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  // Admin: Get payment statistics
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Add admin check middleware
      // if (!req.user?.isAdmin) {
      //   res.status(403).json({
      //     success: false,
      //     message: 'Admin access required',
      //   });
      //   return;
      // }

      const { startDate, endDate } = req.query;
      
      const stats = await paymentService.getPaymentStatistics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Process refund (admin only)
  async processRefund(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Add admin check middleware
      // if (!req.user?.isAdmin) {
      //   res.status(403).json({
      //     success: false,
      //     message: 'Admin access required',
      //   });
      //   return;
      // }

      const { paymentIntentId } = req.params;
      const { amount } = req.body;

      if (!paymentIntentId) {
        res.status(400).json({
          success: false,
          message: 'Payment intent ID is required',
        });
        return;
      }

      const refund = await paymentService.processRefund(paymentIntentId, amount);

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: refund,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Transaction not found') {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      next(error);
    }
  }
}

export default new PaymentController();