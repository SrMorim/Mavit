/**
 * Note Routes (Bloco de Notas Module)
 * RESTful routes for note management with rich text content and collaboration features
 */

import { Router } from 'express';
import { noteController } from '../controllers/noteController';
import { validate } from '../middleware/validation';
import { noteValidation } from '../validations/noteValidation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the note
 *         title:
 *           type: string
 *           maxLength: 300
 *           description: Note title
 *         content:
 *           type: string
 *           description: Rich text content (HTML/Markdown)
 *         plainTextContent:
 *           type: string
 *           description: Plain text version for search
 *         category:
 *           type: string
 *           maxLength: 100
 *           description: Note category
 *         color:
 *           type: string
 *           pattern: '^#[0-9a-fA-F]{6}$'
 *           description: Note color in hex format
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 20
 *           description: Note tags
 *         isPinned:
 *           type: boolean
 *           description: Whether the note is pinned
 *         isArchived:
 *           type: boolean
 *           description: Whether the note is archived
 *         isTemplate:
 *           type: boolean
 *           description: Whether the note is a template
 *         reminderDate:
 *           type: string
 *           format: date-time
 *           description: Reminder date for the note
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         preview:
 *           type: string
 *           description: Content preview (first 200 chars)
 *         versionCount:
 *           type: integer
 *           description: Number of versions
 *       required:
 *         - content
 *   
 *     NoteVersion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the version
 *         title:
 *           type: string
 *           description: Note title at this version
 *         content:
 *           type: string
 *           description: Note content at this version
 *         size:
 *           type: integer
 *           description: Content size in bytes
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get notes with pagination and filters
 *     tags: [Notes]
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
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, isPinned]
 *           default: updatedAt
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
 *           maxLength: 200
 *         description: Search in title, content, and category
 *       - in: query
 *         name: isArchived
 *         schema:
 *           type: boolean
 *         description: Filter by archived status
 *       - in: query
 *         name: isPinned
 *         schema:
 *           type: boolean
 *         description: Filter by pinned status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by color
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
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
 *                     notes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Note'
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
 *                     alerts:
 *                       type: object
 *                       properties:
 *                         upcomingReminders:
 *                           type: integer
 *                         reminders:
 *                           type: array
 */
router.get(
  '/', 
  validate(noteValidation.getNotes), 
  noteController.getNotes
);

/**
 * @swagger
 * /api/notes/stats:
 *   get:
 *     summary: Get note statistics
 *     tags: [Notes]
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
router.get('/stats', noteController.getNoteStats);

/**
 * @swagger
 * /api/notes/search:
 *   post:
 *     summary: Advanced note search
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               searchIn:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [title, content, tags, category]
 *                 default: [title, content]
 *               matchType:
 *                 type: string
 *                 enum: [partial, exact, fuzzy]
 *                 default: partial
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 20
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *               dateFrom:
 *                 type: string
 *                 format: date
 *               dateTo:
 *                 type: string
 *                 format: date
 *             required:
 *               - query
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.post(
  '/search',
  validate(noteValidation.searchNotes),
  noteController.searchNotes
);

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get single note with full content
 *     tags: [Notes]
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
 *         name: includeVersions
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include version history
 *     responses:
 *       200:
 *         description: Note retrieved successfully
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
 *                     note:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Note'
 *                         - type: object
 *                           properties:
 *                             versions:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/NoteVersion'
 *       404:
 *         description: Note not found
 */
router.get('/:id', noteController.getNote);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create new note
 *     tags: [Notes]
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
 *                 maxLength: 300
 *               content:
 *                 type: string
 *                 maxLength: 10000000
 *               plainTextContent:
 *                 type: string
 *                 maxLength: 1000000
 *               category:
 *                 type: string
 *                 maxLength: 100
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9a-fA-F]{6}$'
 *                 default: '#ffffff'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *               isPinned:
 *                 type: boolean
 *                 default: false
 *               isTemplate:
 *                 type: boolean
 *                 default: false
 *               reminderDate:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Note created successfully
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
 *                     note:
 *                       $ref: '#/components/schemas/Note'
 */
router.post(
  '/', 
  validate(noteValidation.createNote), 
  noteController.createNote
);

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update note
 *     tags: [Notes]
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
 *                 maxLength: 300
 *               content:
 *                 type: string
 *                 maxLength: 10000000
 *               plainTextContent:
 *                 type: string
 *                 maxLength: 1000000
 *               category:
 *                 type: string
 *                 maxLength: 100
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9a-fA-F]{6}$'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *               isPinned:
 *                 type: boolean
 *               isArchived:
 *                 type: boolean
 *               isTemplate:
 *                 type: boolean
 *               reminderDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 */
router.put(
  '/:id', 
  validate(noteValidation.updateNote), 
  noteController.updateNote
);

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete note and all versions
 *     tags: [Notes]
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
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 */
router.delete('/:id', noteController.deleteNote);

/**
 * @swagger
 * /api/notes/bulk/update:
 *   patch:
 *     summary: Bulk update notes
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               noteIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 100
 *               updates:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                     maxLength: 100
 *                   color:
 *                     type: string
 *                     pattern: '^#[0-9a-fA-F]{6}$'
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                     maxItems: 20
 *                   isPinned:
 *                     type: boolean
 *                   isArchived:
 *                     type: boolean
 *             required:
 *               - noteIds
 *               - updates
 *     responses:
 *       200:
 *         description: Notes updated successfully
 */
router.patch(
  '/bulk/update',
  validate(noteValidation.bulkUpdateNotes),
  noteController.bulkUpdateNotes
);

// Version Management Routes

/**
 * @swagger
 * /api/notes/{id}/versions:
 *   get:
 *     summary: Get note versions
 *     tags: [Notes]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Note versions retrieved successfully
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
 *                     versions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NoteVersion'
 *                     pagination:
 *                       type: object
 *       404:
 *         description: Note not found
 */
router.get('/:id/versions', noteController.getNoteVersions);

/**
 * @swagger
 * /api/notes/{id}/versions/{versionId}:
 *   get:
 *     summary: Get specific note version content
 *     tags: [Notes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Note version retrieved successfully
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
 *                     version:
 *                       $ref: '#/components/schemas/NoteVersion'
 *       404:
 *         description: Note or version not found
 */
router.get('/:id/versions/:versionId', noteController.getNoteVersion);

export default router;