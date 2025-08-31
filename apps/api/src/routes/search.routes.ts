import { Router } from 'express';

const router = Router();

router.get('/suggestions', (req, res) => {
  res.json({ message: 'Search suggestions endpoint - to be implemented' });
});

router.post('/alerts', (req, res) => {
  res.json({ message: 'Create search alert endpoint - to be implemented' });
});

router.get('/alerts', (req, res) => {
  res.json({ message: 'Get search alerts endpoint - to be implemented' });
});

export default router;