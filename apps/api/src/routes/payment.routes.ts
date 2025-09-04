import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public endpoints
router.get('/packages', paymentController.getPackages);
router.get('/packages/:id', paymentController.getPackageById);

// Webhook endpoint (raw body is handled in server.ts)
router.post('/webhook', paymentController.handleWebhook);

// Authenticated endpoints
router.post('/checkout', authenticate, paymentController.createCheckoutSession);
router.get('/transactions', authenticate, paymentController.getUserTransactions);
router.get('/transactions/:id', authenticate, paymentController.getTransactionById);

// Admin endpoints (TODO: Add admin middleware)
router.post('/admin/packages', authenticate, paymentController.createPackage);
router.put('/admin/packages/:id', authenticate, paymentController.updatePackage);
router.get('/admin/statistics', authenticate, paymentController.getStatistics);
router.post('/admin/refund/:paymentIntentId', authenticate, paymentController.processRefund);

export default router;