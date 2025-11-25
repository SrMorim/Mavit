/**
 * List Controller (Listas Module)
 * Handles CRUD operations for lists and list items with Apple Reminders-style functionality
 */

import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { eventBus } from '../services/eventBus';
import { 
  NotFoundError, 
  ValidationError,
  catchAsync 
} from '../middleware/errorHandler';

class ListController {
  // Get lists with pagination and filters
  getLists = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      isArchived,
      color,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { userId };

    if (typeof isArchived !== 'undefined') where.isArchived = isArchived === 'true';
    if (color) where.color = color;
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get lists with count and item statistics
    const [lists, totalCount] = await Promise.all([
      prisma.list.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          isShared: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { 
              items: true,
            },
          },
        },
      }),
      prisma.list.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    // Enhance with completion statistics
    const enhancedLists = await Promise.all(
      lists.map(async (list) => {
        const [totalItems, completedItems, pendingItems] = await Promise.all([
          prisma.listItem.count({ where: { listId: list.id } }),
          prisma.listItem.count({ where: { listId: list.id, isCompleted: true } }),
          prisma.listItem.count({ where: { listId: list.id, isCompleted: false } }),
        ]);

        return {
          ...list,
          stats: {
            totalItems,
            completedItems,
            pendingItems,
            completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
          },
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        lists: enhancedLists,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasMore: Number(page) < totalPages,
        },
      },
    });
  });

  // Get single list with items
  getList = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { includeCompleted = true } = req.query;

    const list = await prisma.list.findFirst({
      where: { id, userId },
      include: {
        items: {
          where: includeCompleted === 'false' ? { isCompleted: false } : {},
          select: {
            id: true,
            title: true,
            notes: true,
            priority: true,
            isCompleted: true,
            dueDate: true,
            completedAt: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    res.status(200).json({
      status: 'success',
      data: { list },
    });
  });

  // Create new list
  createList = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      name,
      description,
      color = '#3b82f6',
      isShared = false,
    } = req.body;

    const list = await prisma.list.create({
      data: {
        userId,
        name,
        description,
        color,
        isShared,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        isShared: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Emit event for synchronization
    await eventBus.emitEvent('list:created', list, userId, list.id);

    logger.info('List created:', {
      userId,
      listId: list.id,
      name: list.name,
    });

    res.status(201).json({
      status: 'success',
      data: { list },
    });
  });

  // Update list
  updateList = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if list exists and belongs to user
    const existingList = await prisma.list.findFirst({
      where: { id, userId },
    });

    if (!existingList) {
      throw new NotFoundError('List not found');
    }

    const updatedList = await prisma.list.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        isShared: true,
        isArchived: true,
        updatedAt: true,
      },
    });

    // Emit event for synchronization
    await eventBus.emitEvent('list:updated', { ...updatedList, updatedFields: Object.keys(updateData) }, userId, id as string);

    logger.info('List updated:', {
      userId,
      listId: id,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      status: 'success',
      data: { list: updatedList },
    });
  });

  // Delete list
  deleteList = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Delete list and all its items
    await prisma.$transaction(async (tx) => {
      const deletedList = await tx.list.deleteMany({
        where: { id, userId },
      });

      if (deletedList.count === 0) {
        throw new NotFoundError('List not found');
      }

      // Delete all items in the list
      await tx.listItem.deleteMany({
        where: { listId: id },
      });
    });

    // Emit event for synchronization
    await eventBus.emitEvent('list:deleted', { listId: id }, userId, id as string);

    logger.info('List deleted:', {
      userId,
      listId: id,
    });

    res.status(200).json({
      status: 'success',
      message: 'List deleted successfully',
    });
  });

  // Get list items with pagination and filters
  getListItems = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { listId } = req.params;
    const {
      page = 1,
      limit = 50,
      sortBy = 'order',
      sortOrder = 'asc',
      isCompleted,
      priority,
      search,
      dueDateFrom,
      dueDateTo,
    } = req.query;

    // Check if list exists and belongs to user
    const list = await prisma.list.findFirst({
      where: { id: listId as string, userId },
      select: { id: true },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { listId };

    if (typeof isCompleted !== 'undefined') where.isCompleted = isCompleted === 'true';
    if (priority) where.priority = priority;
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom as string);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo as string);
    }

    // Get items with count
    const [items, totalCount] = await Promise.all([
      prisma.listItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: sortBy === 'order' 
          ? [{ order: sortOrder as any }, { createdAt: 'desc' }]
          : { [sortBy as string]: sortOrder },
        select: {
          id: true,
          title: true,
          notes: true,
          priority: true,
          isCompleted: true,
          dueDate: true,
          completedAt: true,
          order: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.listItem.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      status: 'success',
      data: {
        items,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasMore: Number(page) < totalPages,
        },
      },
    });
  });

  // Create list item
  createListItem = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { listId } = req.params;
    const {
      title,
      description,
      priority = 'MEDIUM',
      dueDate,
      estimatedMinutes,
      tags = [],
      url,
    } = req.body;

    // Check if list exists and belongs to user
    const list = await prisma.list.findFirst({
      where: { id: listId as string, userId },
      select: { id: true },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    // Get next order position
    const lastItem = await prisma.listItem.findFirst({
      where: { listId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = (lastItem?.order || 0) + 1;

    const item = await prisma.listItem.create({
      data: {
        listId,
        title,
        notes: description,
        priority,
        isCompleted: false,
        dueDate: dueDate ? new Date(dueDate) : null,
        order,
      },
      select: {
        id: true,
        title: true,
        notes: true,
        priority: true,
        isCompleted: true,
        dueDate: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Emit event for synchronization
    await eventBus.emitEvent('listItem:created', { ...item, listId }, userId, item.id);

    logger.info('List item created:', {
      userId,
      listId,
      itemId: item.id,
      title: item.title,
    });

    res.status(201).json({
      status: 'success',
      data: { item },
    });
  });

  // Update list item
  updateListItem = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { listId, itemId } = req.params;
    const updateData = req.body;

    // Check if item exists and list belongs to user
    const existingItem = await prisma.listItem.findFirst({
      where: { 
        id: itemId, 
        listId,
        list: { userId } 
      },
      select: { id: true, isCompleted: true },
    });

    if (!existingItem) {
      throw new NotFoundError('List item not found');
    }

    // Handle completion status change
    if (updateData.isCompleted === true && existingItem.isCompleted !== true) {
      updateData.completedAt = new Date();
    } else if (updateData.isCompleted === false && existingItem.isCompleted === true) {
      updateData.completedAt = null;
    }

    const updatedItem = await prisma.listItem.update({
      where: { id: itemId },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : updateData.dueDate,
      },
      select: {
        id: true,
        title: true,
        notes: true,
        priority: true,
        isCompleted: true,
        dueDate: true,
        completedAt: true,
        order: true,
        updatedAt: true,
      },
    });

    // Emit event for synchronization
    await eventBus.emitEvent('listItem:updated', { ...updatedItem, listId, updatedFields: Object.keys(updateData) }, userId, itemId as string);

    logger.info('List item updated:', {
      userId,
      listId,
      itemId,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      status: 'success',
      data: { item: updatedItem },
    });
  });

  // Delete list item
  deleteListItem = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { listId, itemId } = req.params;

    const deletedItem = await prisma.listItem.deleteMany({
      where: { 
        id: itemId, 
        listId,
        list: { userId } 
      },
    });

    if (deletedItem.count === 0) {
      throw new NotFoundError('List item not found');
    }

    // Emit event for synchronization
    await eventBus.emitEvent('listItem:deleted', { itemId, listId }, userId, itemId as string);

    logger.info('List item deleted:', {
      userId,
      listId,
      itemId,
    });

    res.status(200).json({
      status: 'success',
      message: 'List item deleted successfully',
    });
  });

  // Bulk update list items
  bulkUpdateItems = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { listId } = req.params;
    const { itemIds, updates } = req.body;

    // Verify list ownership and item existence
    const [list, items] = await Promise.all([
      prisma.list.findFirst({
        where: { id: listId as string, userId },
        select: { id: true },
      }),
      prisma.listItem.findMany({
        where: { 
          id: { in: itemIds },
          listId 
        },
        select: { id: true },
      }),
    ]);

    if (!list) {
      throw new NotFoundError('List not found');
    }

    if (items.length !== itemIds.length) {
      throw new NotFoundError('Some items not found');
    }

    // Handle completion status change for bulk update
    if (updates.isCompleted === true) {
      updates.completedAt = new Date();
    }

    const updatedItems = await prisma.listItem.updateMany({
      where: {
        id: { in: itemIds },
        listId,
      },
      data: {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : updates.dueDate,
      },
    });

    logger.info('Bulk list item update:', {
      userId,
      listId,
      itemIds,
      updatedCount: updatedItems.count,
      updates: Object.keys(updates),
    });

    res.status(200).json({
      status: 'success',
      data: {
        updatedCount: updatedItems.count,
        message: `${updatedItems.count} items updated successfully`,
      },
    });
  });

  // Reorder list items
  reorderItems = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { listId } = req.params;
    const { itemIds } = req.body;

    // Check if list exists and belongs to user
    const list = await prisma.list.findFirst({
      where: { id: listId as string, userId },
      select: { id: true },
    });

    if (!list) {
      throw new NotFoundError('List not found');
    }

    // Update positions in transaction
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < itemIds.length; i++) {
        await tx.listItem.update({
          where: { 
            id: itemIds[i],
            listId: listId as string
          },
          data: { order: i + 1 },
        });
      }
    });

    logger.info('List items reordered:', {
      userId,
      listId,
      itemCount: itemIds.length,
    });

    res.status(200).json({
      status: 'success',
      message: 'Items reordered successfully',
    });
  });

  // Get list statistics
  getListStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalLists,
        activeLists,
        archivedLists,
        totalItems,
        completedItems,
        pendingItems,
        itemsByPriority,
        itemsByCompletion,
        recentActivity,
      ] = await Promise.all([
        tx.list.count({ where: { userId } }),
        tx.list.count({ where: { userId, isArchived: false } }),
        tx.list.count({ where: { userId, isArchived: true } }),
        tx.listItem.count({
          where: { list: { userId } }
        }),
        tx.listItem.count({
          where: { list: { userId }, isCompleted: true }
        }),
        tx.listItem.count({
          where: { list: { userId }, isCompleted: false }
        }),
        tx.listItem.groupBy({
          by: ['priority'],
          where: { list: { userId } },
          _count: { priority: true },
        }),
        tx.listItem.groupBy({
          by: ['isCompleted'],
          where: { list: { userId } },
          _count: { isCompleted: true },
        }),
        tx.listItem.findMany({
          where: { 
            list: { userId },
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            }
          },
          select: {
            id: true,
            title: true,
            isCompleted: true, // Changed from status to isCompleted (actual schema field)
            updatedAt: true,
            list: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
      ]);

      return {
        overview: {
          totalLists,
          activeLists,
          archivedLists,
          totalItems,
          completedItems,
          pendingItems,
          completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        },
        byPriority: itemsByPriority.reduce((acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        }, {} as Record<string, number>),
        byCompletion: itemsByCompletion.reduce((acc, item) => {
          acc[item.isCompleted ? 'completed' : 'pending'] = item._count.isCompleted;
          return acc;
        }, {} as Record<string, number>),
        recentActivity,
      };
    });

    res.status(200).json({
      status: 'success',
      data: { statistics: stats },
    });
  });
}

export const listController = new ListController();