import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { authenticate, optionalAuth } from '../middleware/auth';
import { param, query, body, validationResult } from 'express-validator';

const router = Router();
const analyticsService = new AnalyticsService();

/**
 * GET /api/analytics/listings/:id
 * Get analytics for a specific listing
 */
router.get(
  '/listings/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid listing ID'),
    query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const days = req.query.days ? Number(req.query.days) : 30;

      const analytics = await analyticsService.getListingAnalytics(
        id,
        req.user!.userId,
        days
      );

      res.json(analytics);
    } catch (error) {
      console.error('Error getting listing analytics:', error);
      if (error instanceof Error && error.message === 'Listing not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get listing analytics' });
    }
  }
);

/**
 * GET /api/analytics/dashboard
 * Get user dashboard analytics
 */
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const dashboard = await analyticsService.getUserDashboard(req.user!.userId);
    
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to get dashboard analytics' });
  }
});

/**
 * GET /api/analytics/trends
 * Get market trends
 */
router.get(
  '/trends',
  [
    query('province').optional().isString(),
    query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const province = req.query.province as string | undefined;
      const days = req.query.days ? Number(req.query.days) : 30;

      const trends = await analyticsService.getMarketTrends(province, days);

      res.json(trends);
    } catch (error) {
      console.error('Error getting market trends:', error);
      res.status(500).json({ error: 'Failed to get market trends' });
    }
  }
);

/**
 * POST /api/analytics/events
 * Track user events
 */
router.post(
  '/events',
  optionalAuth,
  [
    body('type')
      .isIn(['view', 'message', 'save', 'click', 'search', 'filter'])
      .withMessage('Invalid event type'),
    body('entityType')
      .isIn(['listing', 'user', 'search'])
      .withMessage('Invalid entity type'),
    body('entityId').isString().notEmpty().withMessage('Entity ID is required'),
    body('metadata').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, entityType, entityId, metadata } = req.body;

      // Special handling for listing views
      if (type === 'view' && entityType === 'listing') {
        await analyticsService.trackListingView(
          entityId,
          req.user?.userId
        );
      } else {
        // Track general events
        await analyticsService.trackEvent({
          type,
          entityType,
          entityId,
          userId: req.user?.userId,
          metadata,
        });
      }

      res.json({ message: 'Event tracked successfully' });
    } catch (error) {
      console.error('Error tracking event:', error);
      res.status(500).json({ error: 'Failed to track event' });
    }
  }
);

/**
 * POST /api/analytics/listings/:id/view
 * Track a listing view (simplified endpoint)
 */
router.post(
  '/listings/:id/view',
  optionalAuth,
  [
    param('id').isUUID().withMessage('Invalid listing ID'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      await analyticsService.trackListingView(
        id,
        req.user?.userId
      );

      res.json({ message: 'View tracked successfully' });
    } catch (error) {
      console.error('Error tracking listing view:', error);
      res.status(500).json({ error: 'Failed to track listing view' });
    }
  }
);

/**
 * GET /api/analytics/export
 * Export analytics data (CSV)
 */
router.get(
  '/export',
  authenticate,
  [
    query('type').isIn(['listings', 'dashboard']).withMessage('Invalid export type'),
    query('format').optional().isIn(['csv', 'json']).withMessage('Invalid format'),
    query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, format = 'csv' } = req.query;
      const days = req.query.days ? Number(req.query.days) : 30;

      if (type === 'dashboard') {
        const dashboard = await analyticsService.getUserDashboard(req.user!.userId);

        if (format === 'csv') {
          // Convert dashboard data to CSV
          const csv = convertDashboardToCSV(dashboard);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=dashboard-analytics.csv');
          res.send(csv);
        } else {
          res.json(dashboard);
        }
      } else {
        // For listings export, we'd need to get all user listings
        res.status(501).json({ error: 'Listings export not implemented yet' });
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({ error: 'Failed to export analytics' });
    }
  }
);

/**
 * Helper function to convert dashboard data to CSV
 */
function convertDashboardToCSV(dashboard: any): string {
  const lines: string[] = [];
  
  // Overview section
  lines.push('Overview');
  lines.push('Metric,Value');
  lines.push(`Total Listings,${dashboard.overview.totalListings}`);
  lines.push(`Active Listings,${dashboard.overview.activeListings}`);
  lines.push(`Sold Listings,${dashboard.overview.soldListings}`);
  lines.push(`Total Views,${dashboard.overview.totalViews}`);
  lines.push(`Total Messages,${dashboard.overview.totalMessages}`);
  lines.push(`Total Saves,${dashboard.overview.totalSaves}`);
  lines.push('');
  
  // Top Listings
  lines.push('Top Listings');
  lines.push('Title,Views,Messages');
  dashboard.performance.topListings.forEach((listing: any) => {
    lines.push(`"${listing.title}",${listing.views},${listing.messages}`);
  });
  lines.push('');
  
  // Revenue
  lines.push('Revenue');
  lines.push('Type,Amount');
  lines.push(`Total,$${dashboard.revenue.total}`);
  lines.push(`Featured,$${dashboard.revenue.featured}`);
  
  return lines.join('\n');
}

export default router;