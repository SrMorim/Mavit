/**
 * Event Controller (Calendário Module)
 * Handles CRUD operations for calendar events with recurring support and reminders
 */

import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { eventBus } from '../services/eventBus';
import { parseJsonArrayFields, parseJsonArrayFieldsInList, stringifyJsonArray } from '../utils/jsonArrayHelpers';
import { 
  NotFoundError, 
  ValidationError,
  catchAsync 
} from '../middleware/errorHandler';

class EventController {
  // Get events with pagination and filters
  getEvents = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 10,
      sortBy = 'startDate',
      sortOrder = 'asc',
      startDate,
      endDate,
      search,
      view = 'month',
      color,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { userId };

    // Date filtering for calendar views
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate as string);
      if (endDate) where.startDate.lte = new Date(endDate as string);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (color) {
      where.color = color;
    }

    // Get events with count
    const [rawEvents, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          allDay: true,
          location: true,
          color: true,
          isRecurring: true,
          recurrence: true,
          reminders: true,
          createdAt: true,
          updatedAt: true,
          // Include related tasks if synced with backlog
          tasks: {
            select: {
              id: true,
              title: true,
              priority: true,
              status: true,
            },
            take: 1, // Only show one related task
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Parse JSON array fields
    const events = parseJsonArrayFieldsInList(rawEvents, ['reminders']);

    const totalPages = Math.ceil(totalCount / Number(limit));

    // Calculate upcoming reminders (within 24 hours)
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingReminders = events.filter(event => {
      const reminders = Array.isArray(event.reminders) ? event.reminders : [];
      if (!reminders || reminders.length === 0) return false;
      const eventTime = event.startDate.getTime();
      
      return reminders.some((reminderMinutes: number) => {
        const reminderTime = eventTime - (reminderMinutes * 60 * 1000);
        return reminderTime >= now.getTime() && reminderTime <= twentyFourHoursFromNow.getTime();
      });
    });

    res.status(200).json({
      status: 'success',
      data: {
        events,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasMore: Number(page) < totalPages,
        },
        alerts: {
          upcomingReminders: upcomingReminders.length,
          events: upcomingReminders.map(event => ({
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            reminders: event.reminders,
          })),
        },
      },
    });
  });

  // Get single event
  getEvent = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const rawEvent = await prisma.event.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        allDay: true,
        location: true,
        color: true,
        isRecurring: true,
        recurrence: true,
        reminders: true,
        createdAt: true,
        updatedAt: true,
        tasks: {
          select: {
            id: true,
            title: true,
            priority: true,
            status: true,
            dueDate: true,
          },
          take: 1, // Only show one related task
        },
      },
    });

    if (!rawEvent) {
      throw new NotFoundError('Event not found');
    }

    // Parse JSON array fields
    const event = parseJsonArrayFields(rawEvent, ['reminders']);


    res.status(200).json({
      status: 'success',
      data: { event },
    });
  });

  // Create new event
  createEvent = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      title,
      description,
      startDate,
      endDate,
      allDay = false,
      location,
      color = '#ef4444',
      isRecurring = false,
      recurrence,
      reminders = [15],
    } = req.body;

    // Create event in transaction (for potential task sync)
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          userId,
          title,
          description,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          allDay,
          location,
          color,
          isRecurring,
          recurrence: isRecurring ? recurrence : null,
          reminders: stringifyJsonArray(reminders),
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          allDay: true,
          location: true,
          color: true,
          isRecurring: true,
          recurrence: true,
          reminders: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // TODO: Create recurring instances if isRecurring is true
      // This would involve generating multiple event instances based on recurrence pattern

      return event;
    });

    // Parse JSON array fields for response
    const parsedResult = parseJsonArrayFields(result, ['reminders']);

    // Emit event for synchronization
    await eventBus.emitEvent('event:created', parsedResult, userId, parsedResult.id);

    logger.info('Event created:', {
      userId,
      eventId: result.id,
      title: result.title,
      startDate: result.startDate,
      isRecurring: result.isRecurring,
    });

    res.status(201).json({
      status: 'success',
      data: { event: parsedResult },
    });
  });

  // Update event
  updateEvent = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: { id, userId },
    });

    if (!existingEvent) {
      throw new NotFoundError('Event not found');
    }

    // Prepare update data with JSON array conversion
    const processedUpdateData = { ...updateData };
    if (updateData.reminders !== undefined) {
      processedUpdateData.reminders = stringifyJsonArray(updateData.reminders);
    }

    // Update event in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedEvent = await tx.event.update({
        where: { id },
        data: {
          ...processedUpdateData,
          startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
          endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
          recurrence: updateData.isRecurring === false ? null : updateData.recurrence,
        },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          allDay: true,
          location: true,
          color: true,
          isRecurring: true,
          recurrence: true,
          reminders: true,
          updatedAt: true,
        },
      });

      // TODO: Update recurring instances if recurrence changed
      
      return updatedEvent;
    });

    // Parse JSON array fields for response
    const parsedResult = parseJsonArrayFields(result, ['reminders']);

    // Emit event for synchronization
    await eventBus.emitEvent('event:updated', { ...parsedResult, updatedFields: Object.keys(updateData) }, userId, id as string);

    logger.info('Event updated:', {
      userId,
      eventId: id,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      status: 'success',
      data: { event: parsedResult },
    });
  });

  // Delete event
  deleteEvent = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { deleteRecurring = false } = req.query;

    // Delete event and handle recurring instances
    await prisma.$transaction(async (tx) => {
      const deletedEvent = await tx.event.deleteMany({
        where: { id, userId },
      });

      if (deletedEvent.count === 0) {
        throw new NotFoundError('Event not found');
      }

      // TODO: Handle deletion of recurring instances if deleteRecurring is true
    });

    // Emit event for synchronization
    await eventBus.emitEvent('event:deleted', { eventId: id }, userId, id as string);

    logger.info('Event deleted:', {
      userId,
      eventId: id,
      deleteRecurring,
    });

    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully',
    });
  });

  // Get calendar view data
  getCalendarView = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { view = 'month', date } = req.query;
    
    const viewDate = date ? new Date(date as string) : new Date();
    let startDate: Date;
    let endDate: Date;

    // Calculate date range based on view
    switch (view) {
      case 'day':
        startDate = new Date(viewDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(viewDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'week':
        const dayOfWeek = viewDate.getDay();
        startDate = new Date(viewDate);
        startDate.setDate(viewDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'month':
        startDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        endDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'year':
        startDate = new Date(viewDate.getFullYear(), 0, 1);
        endDate = new Date(viewDate.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      default:
        throw new ValidationError('Invalid view parameter');
    }

    // Get events for the date range
    const rawEvents = await prisma.event.findMany({
      where: {
        userId,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        allDay: true,
        location: true,
        color: true,
        isRecurring: true,
        recurrence: true,
        reminders: true,
        tasks: {
          select: {
            id: true,
            title: true,
            priority: true,
            status: true,
          },
          take: 1, // Only show one related task
        },
      },
      orderBy: { startDate: 'asc' },
    });

    // Parse JSON array fields
    const events = parseJsonArrayFieldsInList(rawEvents, ['reminders']);

    res.status(200).json({
      status: 'success',
      data: {
        view,
        dateRange: {
          startDate,
          endDate,
        },
        events,
        eventCount: events.length,
      },
    });
  });

  // Bulk update events
  bulkUpdateEvents = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { eventIds, updates } = req.body;

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      throw new ValidationError('Event IDs are required');
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new ValidationError('Update data is required');
    }

    // Validate that all events belong to the user
    const existingEvents = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
        userId,
      },
      select: { id: true },
    });

    if (existingEvents.length !== eventIds.length) {
      throw new NotFoundError('Some events not found or access denied');
    }

    // Bulk update events
    const processedUpdates = { ...updates };
    if (updates.reminders !== undefined) {
      processedUpdates.reminders = stringifyJsonArray(updates.reminders);
    }

    const updatedEvents = await prisma.event.updateMany({
      where: {
        id: { in: eventIds },
        userId,
      },
      data: processedUpdates,
    });

    logger.info('Bulk event update:', {
      userId,
      eventIds,
      updatedCount: updatedEvents.count,
      updates: Object.keys(updates),
    });

    res.status(200).json({
      status: 'success',
      data: {
        updatedCount: updatedEvents.count,
        message: `${updatedEvents.count} events updated successfully`,
      },
    });
  });

  // Import events (e.g., from .ics files)
  importEvents = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { events, overwrite = false } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      throw new ValidationError('Events data is required');
    }

    // Import events in transaction
    const result = await prisma.$transaction(async (tx) => {
      const importedEvents = [];

      for (const eventData of events) {
        const event = await tx.event.create({
          data: {
            userId,
            title: eventData.title,
            description: eventData.description,
            startDate: new Date(eventData.startDate),
            endDate: eventData.endDate ? new Date(eventData.endDate) : null,
            allDay: eventData.allDay || false,
            location: eventData.location,
            color: eventData.color || '#ef4444',
            reminders: stringifyJsonArray(eventData.reminders || []),
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            reminders: true,
          },
        });

        // Parse JSON array fields for each imported event
        const parsedEvent = parseJsonArrayFields(event, ['reminders']);

        importedEvents.push(parsedEvent);
      }

      return importedEvents;
    });

    logger.info('Events imported:', {
      userId,
      importedCount: result.length,
      overwrite,
    });

    res.status(201).json({
      status: 'success',
      data: {
        importedEvents: result,
        count: result.length,
        message: `${result.length} events imported successfully`,
      },
    });
  });
}

export const eventController = new EventController();