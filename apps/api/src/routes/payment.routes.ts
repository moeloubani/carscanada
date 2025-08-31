import { Router } from 'express';

const router = Router();

router.get('/packages', (req, res) => {
  res.json({ message: 'Get packages endpoint - to be implemented' });
});

router.post('/checkout', (req, res) => {
  res.json({ message: 'Create checkout session endpoint - to be implemented' });
});

router.post('/webhook', (req, res) => {
  res.json({ message: 'Stripe webhook endpoint - to be implemented' });
});

export default router;