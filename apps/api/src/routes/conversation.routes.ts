import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get conversations endpoint - to be implemented' });
});

router.get('/:id/messages', (req, res) => {
  res.json({ message: 'Get messages endpoint - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Start conversation endpoint - to be implemented' });
});

router.post('/:id/messages', (req, res) => {
  res.json({ message: 'Send message endpoint - to be implemented' });
});

export default router;