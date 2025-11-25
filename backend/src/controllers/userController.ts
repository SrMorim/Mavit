/**
 * User Controller
 * Handles user profile management and account operations
 */

import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { hashPassword, verifyPassword } from '../utils/encryption';
import { logger } from '../utils/logger';
import { 
  NotFoundError, 
  AuthError, 
  ConflictError,
  ValidationError,
  catchAsync 
} from '../middleware/errorHandler';

class UserController {
  // Get current user profile
  getProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  });

  // Update user profile
  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { name, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ConflictError('Email is already in use');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email, isVerified: false }), // Reset verification if email changed
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      },
    });

    logger.info('User profile updated:', {
      userId,
      updatedFields: Object.keys(req.body),
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  });

  // Change password
  changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and invalidate all sessions except current
    await prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: userId },
        data: { password: newPasswordHash },
      });

      // Invalidate all other sessions (keep current session active)
      await tx.userSession.updateMany({
        where: {
          userId,
          id: { not: req.user!.sessionId },
        },
        data: { isValid: false },
      });
    });

    logger.info('Password changed successfully:', {
      userId,
      ip: req.ip,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  });

  // Delete account
  deleteAccount = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Soft delete by deactivating account
    // In production, you might want to implement a delayed hard delete
    await prisma.$transaction(async (tx) => {
      // Deactivate user
      await tx.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          email: `deleted_${Date.now()}_${userId}@mavit.deleted`, // Anonymize email
          name: 'Deleted User',
        },
      });

      // Invalidate all sessions
      await tx.userSession.updateMany({
        where: { userId },
        data: { isValid: false },
      });

      // TODO: Implement data cleanup for GDPR compliance
      // This would involve deleting or anonymizing user data across all modules
    });

    logger.info('User account deleted:', {
      userId,
      ip: req.ip,
    });

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully',
    });
  });

  // Get active sessions
  getSessions = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.id === req.user!.sessionId,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        sessions: sessionsWithCurrent,
      },
    });
  });

  // Revoke a specific session
  revokeSession = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const currentSessionId = req.user!.sessionId;

    // Prevent revoking current session
    if (sessionId === currentSessionId) {
      throw new ValidationError('Cannot revoke current session. Use logout instead.');
    }

    const result = await prisma.userSession.updateMany({
      where: {
        id: sessionId,
        userId,
        isValid: true,
      },
      data: { isValid: false },
    });

    if (result.count === 0) {
      throw new NotFoundError('Session not found or already revoked');
    }

    logger.info('Session revoked:', {
      userId,
      revokedSessionId: sessionId,
      ip: req.ip,
    });

    res.status(200).json({
      status: 'success',
      message: 'Session revoked successfully',
    });
  });

  // Get user statistics (for dashboard)
  getStatistics = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalTasks,
        completedTasks,
        totalEvents,
        totalNotes,
        totalLists,
        totalTransactions,
      ] = await Promise.all([
        tx.task.count({ where: { userId } }),
        tx.task.count({ where: { userId, status: 'DONE' } }),
        tx.event.count({ where: { userId } }),
        tx.note.count({ where: { userId, isArchived: false } }),
        tx.list.count({ where: { userId, isArchived: false } }),
        tx.transaction.count({ where: { userId } }),
      ]);

      return {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
        },
        events: { total: totalEvents },
        notes: { total: totalNotes },
        lists: { total: totalLists },
        transactions: { total: totalTransactions },
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        statistics: stats,
      },
    });
  });
}

export const userController = new UserController();