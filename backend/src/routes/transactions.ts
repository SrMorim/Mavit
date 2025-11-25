/**
 * Transactions Routes (Finanças Module)
 * Handles financial transactions and expense tracking
 */

import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { transactionValidation } from '../validations/transactionValidation';
import { commonValidations } from '../middleware/validation';
import { userRateLimitMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         amount:
 *           type: number
 *           format: decimal
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         category:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         account:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isRecurring:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get user transactions with pagination and filters
 *     tags: [Transactions]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get('/',
  validateQuery(transactionValidation.getTransactions),
  transactionController.getTransactions
);

/**
 * @swagger
 * /transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats',
  transactionController.getTransactionStats
);

/**
 * @swagger
 * /transactions/insights:
 *   get:
 *     summary: Get financial insights and recommendations
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Insights retrieved successfully
 */
router.get('/insights',
  transactionController.getInsights
);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post('/',
  userRateLimitMiddleware(50), // 50 transactions per window
  validateRequest(transactionValidation.createTransaction),
  transactionController.createTransaction
);

/**
 * @swagger
 * /transactions/bulk:
 *   post:
 *     summary: Bulk import transactions
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Transactions imported successfully
 */
router.post('/bulk',
  userRateLimitMiddleware(5), // 5 bulk imports per window
  validateRequest(transactionValidation.bulkImport),
  transactionController.bulkImport
);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get a specific transaction
 *     tags: [Transactions]
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
 *         description: Transaction retrieved successfully
 */
router.get('/:id',
  validateParams(commonValidations.idParam),
  transactionController.getTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
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
 *         description: Transaction updated successfully
 */
router.put('/:id',
  validateParams(commonValidations.idParam),
  validateRequest(transactionValidation.updateTransaction),
  transactionController.updateTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
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
 *         description: Transaction deleted successfully
 */
router.delete('/:id',
  validateParams(commonValidations.idParam),
  transactionController.deleteTransaction
);

export default router;