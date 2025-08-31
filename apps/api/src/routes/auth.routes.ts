import { Router } from 'express';

const router = Router();

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - to be implemented' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

router.post('/refresh', (req, res) => {
  res.json({ message: 'Refresh token endpoint - to be implemented' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - to be implemented' });
});

export default router;