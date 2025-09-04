import { Router, Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { authenticate, optionalAuth } from '../middleware/auth';
import { body, query, param, validationResult } from 'express-validator';
import { AlertFrequency } from '@prisma/client';

const router = Router();
const searchService = new SearchService();

/**
 * GET /api/search/suggestions
 * Get auto-complete suggestions for makes and models
 */
router.get(
  '/suggestions',
  optionalAuth,
  [
    query('q').notEmpty().withMessage('Query is required'),
    query('type').optional().isIn(['make', 'model']).withMessage('Invalid type'),
    query('make').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { q, type, make } = req.query;
      
      const suggestions = await searchService.getSuggestions(
        q as string,
        type as 'make' | 'model' | undefined,
        make as string | undefined
      );

      // Track search term if user is authenticated
      if (req.user) {
        await searchService.trackSearchTerm(q as string, req.user.userId);
      } else {
        await searchService.trackSearchTerm(q as string);
      }

      res.json({ suggestions });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({ error: 'Failed to get search suggestions' });
    }
  }
);

/**
 * GET /api/search/popular
 * Get popular searches
 */
router.get(
  '/popular',
  [
    query('limit').optional().isInt({ min: 1, max: 20 }).toInt(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const popularSearches = await searchService.getPopularSearches(limit);

      res.json({ searches: popularSearches });
    } catch (error) {
      console.error('Error getting popular searches:', error);
      res.status(500).json({ error: 'Failed to get popular searches' });
    }
  }
);

/**
 * POST /api/search/alerts
 * Create a search alert
 */
router.post(
  '/alerts',
  authenticate,
  [
    body('name').notEmpty().withMessage('Alert name is required'),
    body('filters').isObject().withMessage('Filters must be an object'),
    body('frequency')
      .isIn(['INSTANT', 'DAILY', 'WEEKLY'])
      .withMessage('Invalid frequency'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, filters, frequency } = req.body;
      
      const alert = await searchService.createSearchAlert(
        req.user!.userId,
        {
          name,
          filters,
          frequency: frequency as AlertFrequency,
        }
      );

      res.status(201).json({
        message: 'Search alert created successfully',
        alert,
      });
    } catch (error) {
      console.error('Error creating search alert:', error);
      if (error instanceof Error && error.message.includes('Maximum number')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create search alert' });
    }
  }
);

/**
 * GET /api/search/alerts
 * Get user's search alerts
 */
router.get('/alerts', authenticate, async (req: Request, res: Response) => {
  try {
    const alerts = await searchService.getUserSearchAlerts(req.user!.userId);
    
    res.json({ alerts });
  } catch (error) {
    console.error('Error getting search alerts:', error);
    res.status(500).json({ error: 'Failed to get search alerts' });
  }
});

/**
 * PUT /api/search/alerts/:id
 * Update a search alert
 */
router.put(
  '/alerts/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid alert ID'),
    body('name').optional().notEmpty().withMessage('Alert name cannot be empty'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('frequency')
      .optional()
      .isIn(['INSTANT', 'DAILY', 'WEEKLY'])
      .withMessage('Invalid frequency'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateData: any = {};
      
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.filters !== undefined) updateData.filters = req.body.filters;
      if (req.body.frequency !== undefined) updateData.frequency = req.body.frequency;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

      const alert = await searchService.updateSearchAlert(
        id,
        req.user!.userId,
        updateData
      );

      res.json({
        message: 'Search alert updated successfully',
        alert,
      });
    } catch (error) {
      console.error('Error updating search alert:', error);
      if (error instanceof Error && error.message === 'Search alert not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update search alert' });
    }
  }
);

/**
 * DELETE /api/search/alerts/:id
 * Delete a search alert
 */
router.delete(
  '/alerts/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid alert ID'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      
      await searchService.deleteSearchAlert(id, req.user!.userId);

      res.json({ message: 'Search alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting search alert:', error);
      if (error instanceof Error && error.message === 'Search alert not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete search alert' });
    }
  }
);

/**
 * POST /api/search/alerts/:id/test
 * Test a search alert by sending it immediately
 */
router.post(
  '/alerts/:id/test',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid alert ID'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      
      await searchService.testSearchAlert(id, req.user!.userId);

      res.json({ message: 'Test alert sent successfully' });
    } catch (error) {
      console.error('Error testing search alert:', error);
      if (error instanceof Error && error.message === 'Search alert not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to test search alert' });
    }
  }
);

export default router;