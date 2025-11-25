/**
 * Note Controller (Bloco de Notas Module)
 * Handles CRUD operations for notes with rich text content and collaboration features
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

class NoteController {
  // Get notes with pagination and filters
  getNotes = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      search,
      isArchived,
      isFavorite,
      category,
      tags,
      dateFrom,
      dateTo,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { userId };

    if (typeof isArchived !== 'undefined') where.isArchived = isArchived === 'true';
    if (typeof isFavorite !== 'undefined') where.isFavorite = isFavorite === 'true';
    if (category) where.category = category;
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (tags && Array.isArray(tags)) {
      // For SQLite JSON array filtering, we need to check if the JSON array contains all tags
      // This will require a more complex query or post-processing
      // For now, we'll filter in memory after fetching results
    }

    if (dateFrom || dateTo) {
      where.updatedAt = {};
      if (dateFrom) where.updatedAt.gte = new Date(dateFrom as string);
      if (dateTo) where.updatedAt.lte = new Date(dateTo as string);
    }

    // Get notes with count
    const [rawNotes, totalCount] = await Promise.all([
      prisma.note.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: sortBy === 'isFavorite' 
          ? [{ isFavorite: 'desc' }, { updatedAt: 'desc' }]
          : { [sortBy as string]: sortOrder },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          tags: true,
          isFavorite: true,
          isArchived: true,
          hasImages: true,
          wordCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.note.count({ where }),
    ]);

    // Parse JSON array fields and apply tag filtering if needed
    let notes = parseJsonArrayFieldsInList(rawNotes, ['tags']);
    
    // Apply tag filtering in memory if tags were specified
    if (tags && Array.isArray(tags)) {
      notes = notes.filter(note => {
        const noteTags = Array.isArray(note.tags) ? note.tags : [];
        return tags.every(tag => noteTags.includes(tag));
      });
    }

    const totalPages = Math.ceil(totalCount / Number(limit));

    // Add preview content (first 200 chars of content)
    const enhancedNotes = notes.map(note => ({
      ...note,
      preview: note.content ? note.content.substring(0, 200) : '',
      hasContent: !!note.content,
    }));

    // Get upcoming reminders (Note: reminder functionality removed - reminderDate field doesn't exist in schema)
    const upcomingReminders: any[] = [];

    res.status(200).json({
      status: 'success',
      data: {
        notes: enhancedNotes,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasMore: Number(page) < totalPages,
        },
        alerts: {
          upcomingReminders: upcomingReminders.length,
          reminders: upcomingReminders.map(note => ({
            id: note.id,
            title: note.title || 'Untitled Note',
          })),
        },
      },
    });
  });

  // Get single note with full content
  getNote = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { includeVersions = false } = req.query;

    const noteQuery: any = {
      where: { id, userId },
      select: {
        id: true,
        title: true,
        content: true,
        // plainTextContent field doesn't exist in schema - removed
        category: true,
        // color field doesn't exist in schema - removed
        tags: true,
        isFavorite: true, // Changed from isPinned to isFavorite (actual schema field)
        isArchived: true,
        // isTemplate field doesn't exist in schema - removed
        // reminderDate field doesn't exist in schema - removed
        hasImages: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    // Version functionality removed - NoteVersion model doesn't exist in schema
    // if (includeVersions === 'true') {
    //   noteQuery.include = {
    //     versions: {
    //       select: {
    //         id: true,
    //         title: true,
    //         createdAt: true,
    //         size: true,
    //       },
    //       orderBy: { createdAt: 'desc' },
    //       take: 10, // Last 10 versions
    //     },
    //   };
    // }

    const rawNote = await prisma.note.findFirst(noteQuery);

    if (!rawNote) {
      throw new NotFoundError('Note not found');
    }

    // Parse JSON array fields
    const note = parseJsonArrayFields(rawNote, ['tags']);


    res.status(200).json({
      status: 'success',
      data: { note },
    });
  });

  // Create new note
  createNote = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      title = '',
      content,
      // plainTextContent field doesn't exist in schema - removed
      category = '',
      // color field doesn't exist in schema - removed
      tags = [],
      isFavorite = false, // Changed from isPinned to isFavorite (actual schema field)
      // isTemplate field doesn't exist in schema - removed
      // reminderDate field doesn't exist in schema - removed
    } = req.body;

    // Create note in transaction with initial version
    const result = await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          userId,
          title,
          content,
          // plainTextContent field doesn't exist in schema - removed
          category,
          // color field doesn't exist in schema - removed
          tags: stringifyJsonArray(tags),
          isFavorite, // Changed from isPinned to isFavorite (actual schema field)
          isArchived: false,
          // isTemplate field doesn't exist in schema - removed
          // reminderDate field doesn't exist in schema - removed
          hasImages: false,
          wordCount: content ? content.length : 0,
        },
        select: {
          id: true,
          title: true,
          content: true,
          // plainTextContent field doesn't exist in schema - removed
          category: true,
          // color field doesn't exist in schema - removed
          tags: true,
          isFavorite: true, // Changed from isPinned to isFavorite
          isArchived: true,
          // isTemplate field doesn't exist in schema - removed
          // reminderDate field doesn't exist in schema - removed
          hasImages: true,
          wordCount: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Note: NoteVersion model not implemented in schema

      return note;
    });

    // Parse JSON array fields for response
    const parsedResult = parseJsonArrayFields(result, ['tags']);

    // Emit event for synchronization
    await eventBus.emitEvent('note:created', parsedResult, userId, parsedResult.id);

    logger.info('Note created:', {
      userId,
      noteId: result.id,
      title: result.title,
      // isTemplate field doesn't exist in schema - removed
    });

    res.status(201).json({
      status: 'success',
      data: { note: parsedResult },
    });
  });

  // Update note
  updateNote = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existingNote) {
      throw new NotFoundError('Note not found');
    }

    // Prepare update data with JSON array conversion
    const processedUpdateData = {
      title: updateData.title,
      content: updateData.content,
      category: updateData.category,
      tags: updateData.tags !== undefined ? stringifyJsonArray(updateData.tags) : undefined,
      isFavorite: updateData.isFavorite,
      isArchived: updateData.isArchived,
      hasImages: updateData.hasImages,
      wordCount: updateData.content ? updateData.content.length : updateData.wordCount,
    };

    // Update note in transaction with version tracking
    const result = await prisma.$transaction(async (tx) => {
      const updatedNote = await tx.note.update({
        where: { id },
        data: processedUpdateData,
        select: {
          id: true,
          title: true,
          content: true,
          // plainTextContent field doesn't exist in schema - removed
          category: true,
          // color field doesn't exist in schema - removed
          tags: true,
          isFavorite: true, // Changed from isPinned to isFavorite
          isArchived: true,
          // isTemplate field doesn't exist in schema - removed
          // reminderDate field doesn't exist in schema - removed
          hasImages: true,
          wordCount: true,
          updatedAt: true,
        },
      });

      // Version tracking removed - NoteVersion model doesn't exist in schema
      // if (updateData.content && updateData.content !== existingNote.content) {
      //   await tx.noteVersion.create({
      //     data: {
      //       noteId: id,
      //       title: updatedNote.title,
      //       content: updatedNote.content,
      //       size: Buffer.byteLength(updatedNote.content, 'utf8'),
      //     },
      //   });
      // }

      return updatedNote;
    });

    // Parse JSON array fields for response
    const parsedResult = parseJsonArrayFields(result, ['tags']);

    // Emit event for synchronization
    await eventBus.emitEvent('note:updated', { ...parsedResult, updatedFields: Object.keys(updateData) }, userId, id);

    logger.info('Note updated:', {
      userId,
      noteId: id,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      status: 'success',
      data: { note: parsedResult },
    });
  });

  // Delete note
  deleteNote = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Delete note and all versions
    await prisma.$transaction(async (tx) => {
      const deletedNote = await tx.note.deleteMany({
        where: { id, userId },
      });

      if (deletedNote.count === 0) {
        throw new NotFoundError('Note not found');
      }

      // Version deletion removed - NoteVersion model doesn't exist in schema
      // await tx.noteVersion.deleteMany({
      //   where: { noteId: id },
      // });
    });

    // Emit event for synchronization
    await eventBus.emitEvent('note:deleted', { noteId: id }, userId, id);

    logger.info('Note deleted:', {
      userId,
      noteId: id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Note deleted successfully',
    });
  });

  // Bulk update notes
  bulkUpdateNotes = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { noteIds, updates } = req.body;

    // Verify note ownership
    const existingNotes = await prisma.note.findMany({
      where: {
        id: { in: noteIds },
        userId,
      },
      select: { id: true },
    });

    if (existingNotes.length !== noteIds.length) {
      throw new NotFoundError('Some notes not found');
    }

    const updatedNotes = await prisma.note.updateMany({
      where: {
        id: { in: noteIds },
        userId,
      },
      data: updates,
    });

    logger.info('Bulk note update:', {
      userId,
      noteIds,
      updatedCount: updatedNotes.count,
      updates: Object.keys(updates),
    });

    res.status(200).json({
      status: 'success',
      data: {
        updatedCount: updatedNotes.count,
        message: `${updatedNotes.count} notes updated successfully`,
      },
    });
  });

  // Search notes with advanced filters
  searchNotes = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      query,
      searchIn = ['title', 'content'],
      matchType = 'partial',
      page = 1,
      limit = 20,
      categories,
      tags,
      dateFrom,
      dateTo,
    } = req.body;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause for search
    const where: any = { userId };

    // Add date filters if provided
    if (dateFrom || dateTo) {
      where.updatedAt = {};
      if (dateFrom) where.updatedAt.gte = new Date(dateFrom);
      if (dateTo) where.updatedAt.lte = new Date(dateTo);
    }

    // Add category and tag filters
    if (categories && categories.length > 0) {
      where.category = { in: categories };
    }

    // Note: Tag filtering will be done in memory after parsing JSON arrays

    // Build search conditions
    const searchConditions: any[] = [];

    if (searchIn.includes('title')) {
      searchConditions.push({
        title: matchType === 'exact' 
          ? { equals: query, mode: 'insensitive' }
          : { contains: query, mode: 'insensitive' }
      });
    }

    if (searchIn.includes('content')) {
      searchConditions.push({
        content: matchType === 'exact' 
          ? { equals: query, mode: 'insensitive' }
          : { contains: query, mode: 'insensitive' }
      }); // Changed from plainTextContent to content (actual schema field)
    }

    if (searchIn.includes('category')) {
      searchConditions.push({
        category: matchType === 'exact' 
          ? { equals: query, mode: 'insensitive' }
          : { contains: query, mode: 'insensitive' }
      });
    }

    // Note: Tag search will be done in memory after parsing JSON arrays

    if (searchConditions.length > 0) {
      where.OR = searchConditions;
    }

    const [rawNotes, totalCount] = await Promise.all([
      prisma.note.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true, // Changed from plainTextContent to content
          category: true,
          // color field doesn't exist in schema - removed
          tags: true,
          isFavorite: true, // Changed from isPinned to isFavorite
          isArchived: true,
          hasImages: true,
          wordCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.note.count({ where }),
    ]);

    // Parse JSON array fields and apply tag filtering
    let notes = parseJsonArrayFieldsInList(rawNotes, ['tags']);
    
    // Apply tag filtering in memory if tags were specified
    if (tags && tags.length > 0) {
      notes = notes.filter(note => {
        const noteTags = Array.isArray(note.tags) ? note.tags : [];
        return tags.every(tag => noteTags.includes(tag));
      });
    }

    const totalPages = Math.ceil(totalCount / Number(limit));

    // Add highlighted preview for search results
    const enhancedNotes = notes.map(note => ({
      ...note,
      preview: note.content ? note.content.substring(0, 300) : '', // Changed from plainTextContent to content
      highlightedTitle: note.title?.includes(query) ? note.title : null,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        notes: enhancedNotes,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasMore: Number(page) < totalPages,
        },
        searchQuery: query,
        searchIn,
        matchType,
      },
    });
  });

  // Get note statistics
  getNoteStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalNotes,
        favoriteNotes, // Changed from pinnedNotes to favoriteNotes
        archivedNotes,
        // templateNotes removed - isTemplate field doesn't exist
        // notesWithReminders removed - reminderDate field doesn't exist
        notesByCategory,
        recentActivity,
        topTags,
      ] = await Promise.all([
        tx.note.count({ where: { userId } }),
        tx.note.count({ where: { userId, isFavorite: true } }), // Changed from isPinned to isFavorite
        tx.note.count({ where: { userId, isArchived: true } }),
        // Template notes count removed - isTemplate field doesn't exist
        // Notes with reminders count removed - reminderDate field doesn't exist
        tx.note.groupBy({
          by: ['category'],
          where: { userId },
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
          take: 10,
        }),
        tx.note.findMany({
          where: { 
            userId,
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            }
          },
          select: {
            id: true,
            title: true,
            updatedAt: true,
            isFavorite: true, // Changed from isPinned to isFavorite
            isArchived: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
        // Get most frequently used tags
        tx.$queryRaw<Array<{tag: string, count: bigint}>>`
          SELECT unnest(tags) as tag, COUNT(*) as count
          FROM notes
          WHERE user_id = ${userId}
          GROUP BY tag
          ORDER BY count DESC
          LIMIT 20
        `,
      ]);

      return {
        overview: {
          total: totalNotes,
          favorites: favoriteNotes, // Changed from pinned to favorites
          archived: archivedNotes,
          // templates removed - isTemplate field doesn't exist
          // withReminders removed - reminderDate field doesn't exist
          active: totalNotes - archivedNotes,
        },
        categories: notesByCategory.map(cat => ({
          category: cat.category || 'Uncategorized',
          count: cat._count.category,
        })),
        topTags: topTags.map(tag => ({
          tag: tag.tag,
          count: Number(tag.count),
        })),
        recentActivity,
      };
    });

    res.status(200).json({
      status: 'success',
      data: { statistics: stats },
    });
  });

  // Get note versions
  // Version functionality removed - NoteVersion model doesn't exist in schema
  getNoteVersions = catchAsync(async (req: Request, res: Response) => {
    res.status(501).json({
      status: 'error',
      message: 'Note versioning is not implemented - NoteVersion model does not exist in schema',
    });
  });

  // Version functionality removed - NoteVersion model doesn't exist in schema
  getNoteVersion = catchAsync(async (req: Request, res: Response) => {
    res.status(501).json({
      status: 'error',
      message: 'Note versioning is not implemented - NoteVersion model does not exist in schema',
    });
  });
}

export const noteController = new NoteController();