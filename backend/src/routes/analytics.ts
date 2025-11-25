/**
 * Analytics Routes
 * Provides insights and analytics across all modules
 */

import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { validateQuery } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// Query validation for analytics
const analyticsQuery = Joi.object({
  period: Joi.string()
    .valid('7d', '30d', '90d', '1y', 'all')
    .default('30d')
    .messages({
      'any.only': 'Period must be one of: 7d, 30d, 90d, 1y, all',
    }),
  year: Joi.number()
    .integer()
    .min(2020)
    .max(new Date().getFullYear() + 1)
    .optional()
    .messages({
      'number.min': 'Year must be 2020 or later',
      'number.max': 'Year cannot be in the future',
    }),
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .messages({
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12',
    }),
});

/**
 * @swagger
 * /analytics/financial:
 *   get:
 *     summary: Get comprehensive financial analytics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *         description: Time period for analysis
 *     responses:
 *       200:
 *         description: Financial analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.get('/financial',
  validateQuery(analyticsQuery),
  analyticsController.getFinancialAnalytics
);

/**
 * @swagger
 * /analytics/productivity:
 *   get:
 *     summary: Get productivity analytics across all modules
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *     responses:
 *       200:
 *         description: Productivity analytics retrieved successfully
 */
router.get('/productivity',
  validateQuery(analyticsQuery),
  analyticsController.getProductivityAnalytics
);

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard overview with key metrics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 */
router.get('/dashboard',
  analyticsController.getDashboardAnalytics
);

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Get trend analysis across modules
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *     responses:
 *       200:
 *         description: Trend analysis retrieved successfully
 */
router.get('/trends',
  validateQuery(analyticsQuery),
  analyticsController.getTrendAnalysis
);

export default router;