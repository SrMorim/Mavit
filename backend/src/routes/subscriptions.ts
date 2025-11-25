/**
 * Subscriptions Routes (Finanças Module)
 * Handles subscription management and tracking
 */

import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { subscriptionValidation } from '../validations/subscriptionValidation';
import { commonValidations } from '../middleware/validation';
import { userRateLimitMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         amount:
 *           type: number
 *           format: decimal
 *         currency:
 *           type: string
 *         billingCycle:
 *           type: string
 *           enum: [WEEKLY, MONTHLY, QUARTERLY, YEARLY]
 *         nextBilling:
 *           type: string
 *           format: date-time
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         category:
 *           type: string
 *         website:
 *           type: string
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Get user subscriptions with filters
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: billingCycle
 *         schema:
 *           type: string
 *           enum: [WEEKLY, MONTHLY, QUARTERLY, YEARLY]
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 */
router.get('/',
  validateQuery(subscriptionValidation.getSubscriptions),
  subscriptionController.getSubscriptions
);

/**
 * @swagger
 * /subscriptions/stats:
 *   get:
 *     summary: Get subscription statistics
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats',
  subscriptionController.getSubscriptionStats
);

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount
 *               - billingCycle
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               billingCycle:
 *                 type: string
 *                 enum: [WEEKLY, MONTHLY, QUARTERLY, YEARLY]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Subscription created successfully
 */
router.post('/',
  userRateLimitMiddleware(20), // 20 subscriptions per window
  validateRequest(subscriptionValidation.createSubscription),
  subscriptionController.createSubscription
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   get:
 *     summary: Get a specific subscription
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 */
router.get('/:id',
  validateParams(commonValidations.idParam),
  subscriptionController.getSubscription
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   put:
 *     summary: Update a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 */
router.put('/:id',
  validateParams(commonValidations.idParam),
  validateRequest(subscriptionValidation.updateSubscription),
  subscriptionController.updateSubscription
);

/**
 * @swagger
 * /subscriptions/{id}/cancel:
 *   post:
 *     summary: Cancel a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelDate:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription canceled successfully
 */
router.post('/:id/cancel',
  validateParams(commonValidations.idParam),
  validateRequest(subscriptionValidation.cancelSubscription),
  subscriptionController.cancelSubscription
);

/**
 * @swagger
 * /subscriptions/{id}/reactivate:
 *   post:
 *     summary: Reactivate a canceled subscription
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription reactivated successfully
 */
router.post('/:id/reactivate',
  validateParams(commonValidations.idParam),
  subscriptionController.reactivateSubscription
);

/**
 * @swagger
 * /subscriptions/{id}:
 *   delete:
 *     summary: Delete a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Subscription deleted successfully
 */
router.delete('/:id',
  validateParams(commonValidations.idParam),
  subscriptionController.deleteSubscription
);

export default router;