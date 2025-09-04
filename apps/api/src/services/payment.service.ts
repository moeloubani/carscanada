import { PrismaClient, TransactionStatus, Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { CreateCheckoutDto, CreatePackageDto, UpdatePackageDto } from '../validators/payment.validator';

class PaymentService {
  private prisma: PrismaClient;
  private stripe: Stripe;

  constructor() {
    this.prisma = new PrismaClient();
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  // Get all active featured packages
  async getPackages(isActive?: boolean) {
    const where: Prisma.FeaturedPackageWhereInput = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const packages = await this.prisma.featuredPackage.findMany({
      where,
      orderBy: { price: 'asc' },
    });

    return packages.map(pkg => ({
      ...pkg,
      price: pkg.price.toNumber(),
      features: pkg.features as string[],
    }));
  }

  // Get single package details
  async getPackageById(id: string) {
    const pkg = await this.prisma.featuredPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    return {
      ...pkg,
      price: pkg.price.toNumber(),
      features: pkg.features as string[],
    };
  }

  // Create a new package (admin only)
  async createPackage(data: CreatePackageDto) {
    const pkg = await this.prisma.featuredPackage.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationDays: data.durationDays,
        features: data.features,
        isActive: data.isActive,
      },
    });

    return {
      ...pkg,
      price: pkg.price.toNumber(),
      features: pkg.features as string[],
    };
  }

  // Update package (admin only)
  async updatePackage(id: string, data: UpdatePackageDto) {
    const pkg = await this.prisma.featuredPackage.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.durationDays !== undefined && { durationDays: data.durationDays }),
        ...(data.features && { features: data.features }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return {
      ...pkg,
      price: pkg.price.toNumber(),
      features: pkg.features as string[],
    };
  }

  // Create Stripe checkout session
  async createCheckoutSession(userId: string, data: CreateCheckoutDto) {
    // Get package details
    const pkg = await this.getPackageById(data.packageId);

    // Verify listing belongs to user
    const listing = await this.prisma.listing.findFirst({
      where: {
        id: data.listingId,
        userId,
      },
    });

    if (!listing) {
      throw new Error('Listing not found or does not belong to user');
    }

    // Check if listing is already featured
    if (listing.isFeatured && listing.featuredUntil && listing.featuredUntil > new Date()) {
      throw new Error('Listing is already featured');
    }

    // Create pending transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        listingId: data.listingId,
        packageId: data.packageId,
        amount: pkg.price,
        currency: 'CAD',
        status: TransactionStatus.PENDING,
      },
    });

    // Create Stripe checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${pkg.name} - Featured Listing`,
              description: `Feature your listing "${listing.title}" for ${pkg.durationDays} days`,
            },
            unit_amount: Math.round(pkg.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: data.successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: data.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        transactionId: transaction.id,
        userId,
        listingId: data.listingId,
        packageId: data.packageId,
      },
      customer_email: await this.getUserEmail(userId),
      locale: 'en',
      payment_intent_data: {
        metadata: {
          transactionId: transaction.id,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
      transactionId: transaction.id,
    };
  }

  // Process successful payment
  async processSuccessfulPayment(session: Stripe.Checkout.Session) {
    const { transactionId, listingId, packageId } = session.metadata as any;

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Update transaction status
      const transaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.COMPLETED,
          stripePaymentId: session.payment_intent as string,
        },
      });

      // Get package details
      const pkg = await tx.featuredPackage.findUnique({
        where: { id: packageId },
      });

      if (!pkg) {
        throw new Error('Package not found');
      }

      // Calculate featured until date
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + pkg.durationDays);

      // Update listing to featured
      const listing = await tx.listing.update({
        where: { id: listingId },
        data: {
          isFeatured: true,
          featuredUntil,
        },
      });

      return { transaction, listing, package: pkg };
    });

    // Send confirmation email
    await this.sendPaymentConfirmation(result.transaction, result.listing, result.package);

    return result;
  }

  // Handle payment failure
  async handlePaymentFailure(session: Stripe.Checkout.Session) {
    const { transactionId } = session.metadata as any;

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.FAILED,
        stripePaymentId: session.payment_intent as string,
      },
    });
  }

  // Handle refund
  async processRefund(paymentIntentId: string, amount?: number) {
    // Find transaction by payment intent
    const transaction = await this.prisma.transaction.findFirst({
      where: { stripePaymentId: paymentIntentId },
      include: {
        listing: true,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Create refund in Stripe
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
    });

    // Update transaction status
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.REFUNDED,
      },
    });

    // Remove featured status from listing if applicable
    if (transaction.listing) {
      await this.prisma.listing.update({
        where: { id: transaction.listing.id },
        data: {
          isFeatured: false,
          featuredUntil: null,
        },
      });
    }

    return refund;
  }

  // Get user transactions
  async getUserTransactions(userId: string, page: number = 1, limit: number = 10, status?: TransactionStatus) {
    const where: Prisma.TransactionWhereInput = { userId };
    if (status) {
      where.status = status;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              make: true,
              model: true,
              year: true,
            },
          },
          package: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map(tx => ({
        ...tx,
        amount: tx.amount.toNumber(),
        package: tx.package ? {
          ...tx.package,
          price: tx.package.price.toNumber(),
          features: tx.package.features as string[],
        } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get single transaction details
  async getTransactionById(id: string, userId?: string) {
    const where: Prisma.TransactionWhereInput = { id };
    if (userId) {
      where.userId = userId;
    }

    const transaction = await this.prisma.transaction.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        listing: true,
        package: true,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return {
      ...transaction,
      amount: transaction.amount.toNumber(),
      listing: transaction.listing ? {
        ...transaction.listing,
        price: transaction.listing.price.toNumber(),
        latitude: transaction.listing.latitude?.toNumber(),
        longitude: transaction.listing.longitude?.toNumber(),
      } : null,
      package: transaction.package ? {
        ...transaction.package,
        price: transaction.package.price.toNumber(),
        features: transaction.package.features as string[],
      } : null,
    };
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  // Handle webhook events
  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.processSuccessfulPayment(session);
        break;

      case 'payment_intent.succeeded':
        // Additional handling if needed
        console.log('Payment intent succeeded:', event.data.object);
        break;

      case 'payment_intent.payment_failed':
        const failedSession = await this.stripe.checkout.sessions.list({
          payment_intent: (event.data.object as any).id,
          limit: 1,
        });
        if (failedSession.data.length > 0) {
          await this.handlePaymentFailure(failedSession.data[0]);
        }
        break;

      case 'charge.refunded':
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await this.processRefund(charge.payment_intent as string);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  // Helper: Get user email
  private async getUserEmail(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return user?.email || '';
  }

  // Helper: Send payment confirmation email
  private async sendPaymentConfirmation(transaction: any, listing: any, pkg: any) {
    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: transaction.userId },
        select: { email: true, firstName: true, lastName: true },
      });

      if (!user) {
        console.error('User not found for payment confirmation email');
        return;
      }

      // Import email service dynamically to avoid circular dependencies
      const { default: emailService } = await import('./email.service');

      await emailService.sendPaymentConfirmation(user.email, {
        userName: `${user.firstName} ${user.lastName}`,
        listingTitle: listing.title,
        packageName: pkg.name,
        amount: transaction.amount.toNumber(),
        currency: transaction.currency,
        featuredUntil: listing.featuredUntil,
        transactionId: transaction.id,
      });
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error);
      // Don't throw - email failure shouldn't break payment processing
    }
  }

  // Get statistics (for admin dashboard)
  async getPaymentStatistics(startDate?: Date, endDate?: Date) {
    const where: Prisma.TransactionWhereInput = {
      status: TransactionStatus.COMPLETED,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalRevenue, transactionCount, packageStats] = await Promise.all([
      this.prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.groupBy({
        by: ['packageId'],
        where,
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount?.toNumber() || 0,
      transactionCount,
      packageStats,
    };
  }
}

export default new PaymentService();