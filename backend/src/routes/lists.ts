/**
 * List Routes (Listas Module)
 * RESTful routes for list and list item management with Apple Reminders-style functionality
 */

import { Router } from 'express';
import { listController } from '../controllers/listController';
import { validate } from '../middleware/validation';
import { listValidation } from '../validations/listValidation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     List:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the list
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: List title
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: List description
 *         color:
 *           type: string
 *           pattern: '^#[0-9a-fA-F]{6}$'
 *           description: List color in hex format
 *         isPrivate:
 *           type: boolean
 *           description: Whether the list is private
 *         isArchived:
 *           type: boolean
 *           description: Whether the list is archived
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         stats:
 *           type: object
 *           description: List statistics
 *           properties:
 *             totalItems:
 *               type: integer
 *             completedItems:
 *               type: integer
 *             pendingItems:
 *               type: integer
 *             completionRate:
 *               type: integer
 *       required:
 *         - title
 *   
 *     ListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the list item
 *         title:
 *           type: string
 *           maxLength: 300
 *           description: Item title
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: Item description
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *           description: Item priority
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELED]
 *           description: Item status
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Item due date
 *         estimatedMinutes:
 *           type: integer
 *           minimum: 1
 *           maximum: 43200
 *           description: Estimated time in minutes
 *         actualMinutes:
 *           type: integer
 *           minimum: 0
 *           maximum: 43200
 *           description: Actual time spent in minutes
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *           description: Item tags
 *         url:
 *           type: string
 *           format: uri
 *           description: Related URL
 *         position:
 *           type: integer
 *           description: Item position in list
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: Completion timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - title
 */

/**
 * @swagger
 * /api/lists:
 *   get:
 *     summary: Get lists with pagination and filters
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search in title and description
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *         description: Filter by archived status
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by list color
 *     responses:
 *       200:
 *         description: Lists retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     lists:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/List'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalCount:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 */
router.get(
  '/', 
  validate(listValidation.getLists), 
  listController.getLists
);

/**
 * @swagger
 * /api/lists/stats:
 *   get:
 *     summary: Get list statistics
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: object
 */
router.get('/stats', listController.getListStats);

/**
 * @swagger
 * /api/lists/{id}:
 *   get:
 *     summary: Get single list with items
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: includeCompleted
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include completed items
 *     responses:
 *       200:
 *         description: List retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       allOf:
 *                         - $ref: '#/components/schemas/List'
 *                         - type: object
 *                           properties:
 *                             items:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/ListItem'
 *       404:
 *         description: List not found
 */
router.get('/:id', listController.getList);

/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Create new list
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9a-fA-F]{6}$'
 *                 default: '#3b82f6'
 *               isPrivate:
 *                 type: boolean
 *                 default: false
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: List created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       $ref: '#/components/schemas/List'
 */
router.post(
  '/', 
  validate(listValidation.createList), 
  listController.createList
);

/**
 * @swagger
 * /api/lists/{id}:
 *   put:
 *     summary: Update list
 *     tags: [Lists]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9a-fA-F]{6}$'
 *               isPrivate:
 *                 type: boolean
 *               isArchived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: List updated successfully
 *       404:
 *         description: List not found
 */
router.put(
  '/:id', 
  validate(listValidation.updateList), 
  listController.updateList
);

/**
 * @swagger
 * /api/lists/{id}:
 *   delete:
 *     summary: Delete list and all its items
 *     tags: [Lists]
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
 *         description: List deleted successfully
 *       404:
 *         description: List not found
 */
router.delete('/:id', listController.deleteList);

// List Items Routes

/**
 * @swagger
 * /api/lists/{listId}/items:
 *   get:
 *     summary: Get list items with pagination and filters
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *       - in: query
 *         name: dueDateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dueDateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List items retrieved successfully
 */
router.get(
  '/:listId/items',
  validate(listValidation.getListItems),
  listController.getListItems
);

/**
 * @swagger
 * /api/lists/{listId}/items:
 *   post:
 *     summary: Create new list item
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 300
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 default: MEDIUM
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               estimatedMinutes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 43200
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *               url:
 *                 type: string
 *                 format: uri
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: List item created successfully
 */
router.post(
  '/:listId/items',
  validate(listValidation.createListItem),
  listController.createListItem
);

/**
 * @swagger
 * /api/lists/{listId}/items/{itemId}:
 *   put:
 *     summary: Update list item
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 300
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELED]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               estimatedMinutes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 43200
 *               actualMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 43200
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *               url:
 *                 type: string
 *                 format: uri
 *               position:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: List item updated successfully
 *       404:
 *         description: List item not found
 */
router.put(
  '/:listId/items/:itemId',
  validate(listValidation.updateListItem),
  listController.updateListItem
);

/**
 * @swagger
 * /api/lists/{listId}/items/{itemId}:
 *   delete:
 *     summary: Delete list item
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List item deleted successfully
 *       404:
 *         description: List item not found
 */
router.delete('/:listId/items/:itemId', listController.deleteListItem);

/**
 * @swagger
 * /api/lists/{listId}/items/bulk/update:
 *   patch:
 *     summary: Bulk update list items
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 100
 *               updates:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELED]
 *                   priority:
 *                     type: string
 *                     enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     maxItems: 10
 *             required:
 *               - itemIds
 *               - updates
 *     responses:
 *       200:
 *         description: Items updated successfully
 */
router.patch(
  '/:listId/items/bulk/update',
  validate(listValidation.bulkUpdateItems),
  listController.bulkUpdateItems
);

/**
 * @swagger
 * /api/lists/{listId}/items/reorder:
 *   patch:
 *     summary: Reorder list items
 *     tags: [Lists]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 1000
 *             required:
 *               - itemIds
 *     responses:
 *       200:
 *         description: Items reordered successfully
 */
router.patch(
  '/:listId/items/reorder',
  validate(listValidation.reorderItems),
  listController.reorderItems
);

export default router;