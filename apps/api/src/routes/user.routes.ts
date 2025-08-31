import { Router } from 'express';

const router = Router();

router.get('/profile', (req, res) => {
  res.json({ message: 'Get profile endpoint - to be implemented' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile endpoint - to be implemented' });
});

export default router;