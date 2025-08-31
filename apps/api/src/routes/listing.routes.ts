import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get listings endpoint - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get listing by ID endpoint - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create listing endpoint - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update listing endpoint - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete listing endpoint - to be implemented' });
});

export default router;