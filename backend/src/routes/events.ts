/**
 * Event Routes (Calendário Module)
 * RESTful routes for calendar event management with comprehensive CRUD operations
 */

import { Router } from 'express';
import { eventController } from '../controllers/eventController';
import { validate } from '../middleware/validation';
import { eventValidation } from '../validations/eventValidation';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the event
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Event title
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: Event description
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Event start date and time
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Event end date and time
 *         allDay:
 *           type: boolean
 *           description: Whether the event is all-day
 *         location:
 *           type: string
 *           maxLength: 500
 *           description: Event location
 *         color:
 *           type: string
 *           pattern: '^#[0-9a-fA-F]{6}$'
 *           description: Event color in hex format
 *         isRecurring:
 *           type: boolean
 *           description: Whether the event is recurring
 *         recurrence:
 *           type: string
 *           enum: [DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM]
 *           description: Recurrence pattern
 *         reminders:
 *           type: array
 *           items:
 *             type: integer
 *             minimum: 0
 *             maximum: 43200
 *           maxItems: 5
 *           description: Reminder times in minutes before event
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         task:
 *           type: object
 *           description: Associated task (if synced from Backlog module)
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             title:
 *               type: string
 *             priority:
 *               type: string
 *               enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *             status:
 *               type: string
 *               enum: [TODO, IN_PROGRESS, REVIEW, DONE]
 *       required:
 *         - title
 *         - startDate
 *   
 *     CalendarView:
 *       type: object
 *       properties:
 *         view:
 *           type: string
 *           enum: [day, week, month, year]
 *           description: Calendar view type
 *         dateRange:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Event'
 *         eventCount:
 *           type: integer
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get events with pagination and filters
 *     tags: [Events]
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
 *           enum: [title, startDate, endDate, createdAt, updatedAt]
 *           default: startDate
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events to this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search in title and description
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filter by event color
 *     responses:
 *       200:
 *         description: Events retrieved successfully
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
 *                         events:
 *                           type: array
 */
router.get(
  '/', 
  validate(eventValidation.getEvents), 
  eventController.getEvents
);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get single event by ID
 *     tags: [Events]
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
 *         description: Event retrieved successfully
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.get('/:id', eventController.getEvent);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create new event
 *     tags: [Events]
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
 *                 maxLength: 2000
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               allDay:
 *                 type: boolean
 *                 default: false
 *               location:
 *                 type: string
 *                 maxLength: 500
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9a-fA-F]{6}$'
 *                 default: '#ef4444'
 *               isRecurring:
 *                 type: boolean
 *                 default: false
 *               recurrence:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM]
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 43200
 *                 maxItems: 5
 *                 default: [15]
 *             required:
 *               - title
 *               - startDate
 *     responses:
 *       201:
 *         description: Event created successfully
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 */
router.post(
  '/', 
  validate(eventValidation.createEvent), 
  eventController.createEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
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
 *                 maxLength: 2000
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               allDay:
 *                 type: boolean
 *               location:
 *                 type: string
 *                 maxLength: 500
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9a-fA-F]{6}$'
 *               isRecurring:
 *                 type: boolean
 *               recurrence:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM]
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 43200
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.put(
  '/:id', 
  validate(eventValidation.updateEvent), 
  eventController.updateEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
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
 *         name: deleteRecurring
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Delete all recurring instances
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete('/:id', eventController.deleteEvent);

/**
 * @swagger
 * /api/events/calendar/view:
 *   get:
 *     summary: Get calendar view data
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Reference date for the view
 *     responses:
 *       200:
 *         description: Calendar view data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CalendarView'
 */
router.get(
  '/calendar/view',
  validate(eventValidation.calendarView),
  eventController.getCalendarView
);

/**
 * @swagger
 * /api/events/bulk/update:
 *   patch:
 *     summary: Bulk update events
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 50
 *               updates:
 *                 type: object
 *                 properties:
 *                   color:
 *                     type: string
 *                     pattern: '^#[0-9a-fA-F]{6}$'
 *                   reminders:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 43200
 *                     maxItems: 5
 *             required:
 *               - eventIds
 *               - updates
 *     responses:
 *       200:
 *         description: Events updated successfully
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
 *                     updatedCount:
 *                       type: integer
 *                     message:
 *                       type: string
 */
router.patch(
  '/bulk/update',
  validate(eventValidation.bulkUpdate),
  eventController.bulkUpdateEvents
);

/**
 * @swagger
 * /api/events/import:
 *   post:
 *     summary: Import events from external sources
 *     tags: [Events]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       minLength: 1
 *                       maxLength: 200
 *                     description:
 *                       type: string
 *                       maxLength: 2000
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     allDay:
 *                       type: boolean
 *                       default: false
 *                     location:
 *                       type: string
 *                       maxLength: 500
 *                     color:
 *                       type: string
 *                       pattern: '^#[0-9a-fA-F]{6}$'
 *                   required:
 *                     - title
 *                     - startDate
 *                 minItems: 1
 *                 maxItems: 1000
 *               overwrite:
 *                 type: boolean
 *                 default: false
 *             required:
 *               - events
 *     responses:
 *       201:
 *         description: Events imported successfully
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
 *                     importedEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                     message:
 *                       type: string
 */
router.post(
  '/import',
  validate(eventValidation.importEvents),
  eventController.importEvents
);

export default router;