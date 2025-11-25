/**
 * Task Controller (Backlog Module)
 * Handles CRUD operations for tasks with priority management and integration
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

class TaskController {
  // Get tasks with pagination and filters
  getTasks = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      search,
      tags,
      dueDateFrom,
      dueDateTo,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { userId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (tags && Array.isArray(tags)) {
      // For SQLite JSON array filtering, we need to check if the JSON array contains all tags
      // This will require a more complex query or post-processing
      // For now, we'll filter in memory after fetching results
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom as string);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo as string);
    }

    // Get tasks with count
    const [rawTasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          dueDate: true,
          startDate: true,
          completedAt: true,
          tags: true,
          estimatedHours: true,
          actualHours: true,
          createdAt: true,
          updatedAt: true,
          // Include related event if synced with calendar
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    // Parse JSON array fields and apply tag filtering if needed
    let tasks = parseJsonArrayFieldsInList(rawTasks, ['tags']);
    
    // Apply tag filtering in memory if tags were specified
    if (tags && Array.isArray(tags)) {
      tasks = tasks.filter(task => {
        const taskTags = Array.isArray(task.tags) ? task.tags : [];
        return tags.every(tag => taskTags.includes(tag));
      });
    }

    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      status: 'success',
      data: {
        tasks,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasMore: Number(page) < totalPages,
        },
      },
    });
  });

  // Get single task
  getTask = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const rawTask = await prisma.task.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        startDate: true,
        completedAt: true,
        tags: true,
        estimatedHours: true,
        actualHours: true,
        createdAt: true,
        updatedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!rawTask) {
      throw new NotFoundError('Task not found');
    }

    // Parse JSON array fields
    const task = parseJsonArrayFields(rawTask, ['tags']);


    res.status(200).json({
      status: 'success',
      data: { task },
    });
  });

  // Create new task
  createTask = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      title,
      description,
      priority = 'MEDIUM',
      dueDate,
      startDate,
      tags = [],
      estimatedHours,
    } = req.body;

    // Create task in transaction (for potential calendar sync)
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          userId,
          title,
          description,
          priority,
          status: 'TODO',
          dueDate: dueDate ? new Date(dueDate) : null,
          startDate: startDate ? new Date(startDate) : null,
          tags: stringifyJsonArray(tags),
          estimatedHours,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          dueDate: true,
          startDate: true,
          tags: true,
          estimatedHours: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // TODO: Sync with calendar if dueDate is provided
      // This will be implemented when we create the calendar integration

      return task;
    });

    // Parse JSON array fields for response
    const parsedResult = parseJsonArrayFields(result, ['tags']);

    // Emit event for synchronization
    await eventBus.emitEvent('task:created', parsedResult, userId, parsedResult.id);

    logger.info('Task created:', {
      userId,
      taskId: result.id,
      title: result.title,
    });

    res.status(201).json({
      status: 'success',
      data: { task: parsedResult },
    });
  });

  // Update task
  updateTask = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    // Handle status change to DONE
    if (updateData.status === 'DONE' && existingTask.status !== 'DONE') {
      updateData.completedAt = new Date();
    } else if (updateData.status !== 'DONE' && existingTask.status === 'DONE') {
      updateData.completedAt = null;
    }

    // Prepare update data with JSON array conversion
    const processedUpdateData = { ...updateData };
    if (updateData.tags !== undefined) {
      processedUpdateData.tags = stringifyJsonArray(updateData.tags);
    }

    // Update task in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          ...processedUpdateData,
          dueDate: updateData.dueDate ? new Date(updateData.dueDate) : updateData.dueDate,
          startDate: updateData.startDate ? new Date(updateData.startDate) : updateData.startDate,
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          dueDate: true,
          startDate: true,
          completedAt: true,
          tags: true,
          estimatedHours: true,
          actualHours: true,
          updatedAt: true,
        },
      });

      // TODO: Update synced calendar event if needed
      
      return updatedTask;
    });

    // Parse JSON array fields for response
    const parsedResult = parseJsonArrayFields(result, ['tags']);

    // Emit event for synchronization
    await eventBus.emitEvent('task:updated', { ...parsedResult, updatedFields: Object.keys(updateData) }, userId, id);

    logger.info('Task updated:', {
      userId,
      taskId: id,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      status: 'success',
      data: { task: parsedResult },
    });
  });

  // Delete task
  deleteTask = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Delete task and handle calendar sync
    await prisma.$transaction(async (tx) => {
      const deletedTask = await tx.task.deleteMany({
        where: { id, userId },
      });

      if (deletedTask.count === 0) {
        throw new NotFoundError('Task not found');
      }

      // TODO: Remove synced calendar event if exists
    });

    // Emit event for synchronization
    await eventBus.emitEvent('task:deleted', { taskId: id }, userId, id);

    logger.info('Task deleted:', {
      userId,
      taskId: id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
    });
  });

  // Get task statistics
  getTaskStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        tasksByPriority,
        tasksByStatus,
      ] = await Promise.all([
        tx.task.count({ where: { userId } }),
        tx.task.count({ where: { userId, status: 'DONE' } }),
        tx.task.count({ 
          where: { 
            userId, 
            status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] } 
          } 
        }),
        tx.task.count({
          where: {
            userId,
            status: { not: 'DONE' },
            dueDate: { lt: new Date() },
          },
        }),
        tx.task.groupBy({
          by: ['priority'],
          where: { userId },
          _count: { priority: true },
        }),
        tx.task.groupBy({
          by: ['status'],
          where: { userId },
          _count: { status: true },
        }),
      ]);

      return {
        overview: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
        byPriority: tasksByPriority.reduce((acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        }, {} as Record<string, number>),
        byStatus: tasksByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { statistics: stats },
    });
  });
}

export const taskController = new TaskController();