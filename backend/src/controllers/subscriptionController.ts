/**
 * Subscription Controller (Finanças Module)
 * Handles CRUD operations for subscription management with billing tracking
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

class SubscriptionController {
  // Get subscriptions with pagination and filters
  getSubscriptions = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 10,
      sortBy = 'nextBilling',
      sortOrder = 'asc',
      isActive,
      billingCycle,
      category,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = { userId };

    if (typeof isActive !== 'undefined') where.isActive = isActive === 'true';
    if (billingCycle) where.billingCycle = billingCycle;
    if (category) where.category = category;
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get subscriptions with count
    const [subscriptions, totalCount] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        select: {
          id: true,
          name: true,
          description: true,
          amount: true,
          currency: true,
          billingCycle: true,
          nextBilling: true,
          startDate: true,
          endDate: true,
          isActive: true,
          category: true,
          website: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { transactions: true },
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    // Calculate next billing alerts (within 7 days)
    const upcomingBillings = subscriptions.filter(sub => {
      if (!sub.isActive || !sub.nextBilling) return false;
      const daysUntilBilling = Math.ceil(
        (sub.nextBilling.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilBilling <= 7 && daysUntilBilling >= 0;
    });

    res.status(200).json({
      status: 'success',
      data: {
        subscriptions,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasMore: Number(page) < totalPages,
        },
        alerts: {
          upcomingBillings: upcomingBillings.length,
          subscriptions: upcomingBillings.map(sub => ({
            id: sub.id,
            name: sub.name,
            amount: sub.amount,
            nextBilling: sub.nextBilling,
          })),
        },
      },
    });
  });

  // Get single subscription
  getSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          select: {
            id: true,
            title: true,
            amount: true,
            date: true,
          },
          orderBy: { date: 'desc' },
          take: 10, // Last 10 transactions
        },
      },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    res.status(200).json({
      status: 'success',
      data: { subscription },
    });
  });

  // Create new subscription
  createSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      name,
      description,
      amount,
      currency = 'BRL',
      billingCycle,
      startDate,
      endDate,
      category,
      website,
      notes,
    } = req.body;

    // Calculate next billing date
    const nextBilling = calculateNextBilling(new Date(startDate), billingCycle);

    // Create subscription in transaction
    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          userId,
          name,
          description,
          amount: Number(amount),
          currency,
          billingCycle,
          nextBilling,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          isActive: true,
          category,
          website,
          notes,
        },
        select: {
          id: true,
          name: true,
          description: true,
          amount: true,
          currency: true,
          billingCycle: true,
          nextBilling: true,
          startDate: true,
          endDate: true,
          isActive: true,
          category: true,
          website: true,
          createdAt: true,
        },
      });

      // Create initial transaction if start date is today or in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);

      if (startDateOnly <= today) {
        await tx.transaction.create({
          data: {
            userId,
            subscriptionId: subscription.id,
            title: `${subscription.name} - ${subscription.billingCycle.toLowerCase()} subscription`,
            description: `Subscription payment for ${subscription.name}`,
            amount: subscription.amount,
            type: 'EXPENSE',
            category: 'subscriptions',
            date: startDateOnly,
            isRecurring: true,
          },
        });
      }

      return subscription;
    });

    // Emit event for synchronization
    await eventBus.emitEvent('subscription:created', result, userId, result.id);

    logger.info('Subscription created:', {
      userId,
      subscriptionId: result.id,
      name: result.name,
      amount: result.amount,
      billingCycle: result.billingCycle,
    });

    res.status(201).json({
      status: 'success',
      data: { subscription: result },
    });
  });

  // Update subscription
  updateSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if subscription exists and belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existingSubscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Recalculate next billing if billing cycle or start date changed
    let nextBilling = existingSubscription.nextBilling;
    if (updateData.billingCycle || updateData.startDate) {
      const cycle = updateData.billingCycle || existingSubscription.billingCycle;
      const start = updateData.startDate 
        ? new Date(updateData.startDate) 
        : existingSubscription.startDate;
      nextBilling = calculateNextBilling(start, cycle);
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...updateData,
        amount: updateData.amount ? Number(updateData.amount) : undefined,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
        nextBilling,
      },
      select: {
        id: true,
        name: true,
        description: true,
        amount: true,
        currency: true,
        billingCycle: true,
        nextBilling: true,
        startDate: true,
        endDate: true,
        isActive: true,
        category: true,
        website: true,
        notes: true,
        updatedAt: true,
      },
    });

    // Emit event for synchronization
    await eventBus.emitEvent('subscription:updated', updatedSubscription, userId, id);

    logger.info('Subscription updated:', {
      userId,
      subscriptionId: id,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      status: 'success',
      data: { subscription: updatedSubscription },
    });
  });

  // Cancel subscription
  cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { cancelDate = new Date(), reason } = req.body;

    // Check if subscription exists and belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id, userId, isActive: true },
    });

    if (!existingSubscription) {
      throw new NotFoundError('Active subscription not found');
    }

    // Cancel subscription
    const canceledSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        isActive: false,
        endDate: new Date(cancelDate),
        notes: reason 
          ? `${existingSubscription.notes || ''}\n\nCanceled on ${new Date(cancelDate).toISOString().split('T')[0]}: ${reason}`.trim()
          : existingSubscription.notes,
      },
      select: {
        id: true,
        name: true,
        endDate: true,
        isActive: true,
      },
    });

    // Emit event for synchronization
    await eventBus.emitEvent('subscription:canceled', canceledSubscription, userId, id);

    logger.info('Subscription canceled:', {
      userId,
      subscriptionId: id,
      cancelDate,
      reason,
    });

    res.status(200).json({
      status: 'success',
      data: { subscription: canceledSubscription },
      message: 'Subscription canceled successfully',
    });
  });

  // Reactivate subscription
  reactivateSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if subscription exists and is inactive
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id, userId, isActive: false },
    });

    if (!existingSubscription) {
      throw new NotFoundError('Inactive subscription not found');
    }

    // Calculate new next billing date
    const nextBilling = calculateNextBilling(new Date(), existingSubscription.billingCycle);

    // Reactivate subscription
    const reactivatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        isActive: true,
        endDate: null,
        nextBilling,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        nextBilling: true,
      },
    });

    logger.info('Subscription reactivated:', {
      userId,
      subscriptionId: id,
    });

    res.status(200).json({
      status: 'success',
      data: { subscription: reactivatedSubscription },
      message: 'Subscription reactivated successfully',
    });
  });

  // Delete subscription
  deleteSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Delete subscription and related transactions
    await prisma.$transaction(async (tx) => {
      const deletedSubscription = await tx.subscription.deleteMany({
        where: { id, userId },
      });

      if (deletedSubscription.count === 0) {
        throw new NotFoundError('Subscription not found');
      }

      // Update related transactions to remove subscription reference
      await tx.transaction.updateMany({
        where: { subscriptionId: id },
        data: { subscriptionId: null },
      });
    });

    logger.info('Subscription deleted:', {
      userId,
      subscriptionId: id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Subscription deleted successfully',
    });
  });

  // Get subscription statistics
  getSubscriptionStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const stats = await prisma.$transaction(async (tx) => {
      // Basic counts and totals
      const [activeSubscriptions, totalSubscriptions, monthlyTotal] = await Promise.all([
        tx.subscription.count({ where: { userId, isActive: true } }),
        tx.subscription.count({ where: { userId } }),
        tx.subscription.aggregate({
          where: { userId, isActive: true },
          _sum: { amount: true },
        }),
      ]);

      // By billing cycle
      const byBillingCycle = await tx.subscription.groupBy({
        by: ['billingCycle'],
        where: { userId, isActive: true },
        _count: { billingCycle: true },
        _sum: { amount: true },
      });

      // By category
      const byCategory = await tx.subscription.groupBy({
        by: ['category'],
        where: { userId, isActive: true },
        _count: { category: true },
        _sum: { amount: true },
      });

      // Upcoming billings (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const upcomingBillings = await tx.subscription.findMany({
        where: {
          userId,
          isActive: true,
          nextBilling: {
            gte: new Date(),
            lte: thirtyDaysFromNow,
          },
        },
        select: {
          id: true,
          name: true,
          amount: true,
          nextBilling: true,
          billingCycle: true,
        },
        orderBy: { nextBilling: 'asc' },
      });

      // Calculate monthly equivalent for all subscriptions
      let monthlyEquivalent = 0;
      for (const cycle of byBillingCycle) {
        const amount = Number(cycle._sum.amount || 0);
        switch (cycle.billingCycle) {
          case 'WEEKLY':
            monthlyEquivalent += amount * 4.33; // ~4.33 weeks per month
            break;
          case 'MONTHLY':
            monthlyEquivalent += amount;
            break;
          case 'QUARTERLY':
            monthlyEquivalent += amount / 3;
            break;
          case 'YEARLY':
            monthlyEquivalent += amount / 12;
            break;
        }
      }

      return {
        overview: {
          activeSubscriptions,
          totalSubscriptions,
          monthlyTotal: Number(monthlyTotal._sum.amount || 0),
          monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
          yearlyProjection: Math.round(monthlyEquivalent * 12 * 100) / 100,
        },
        billingCycles: byBillingCycle.map(cycle => ({
          cycle: cycle.billingCycle,
          count: cycle._count.billingCycle,
          total: Number(cycle._sum.amount || 0),
        })),
        categories: byCategory.map(cat => ({
          category: cat.category || 'Uncategorized',
          count: cat._count.category,
          total: Number(cat._sum.amount || 0),
        })),
        upcomingBillings: upcomingBillings.map(sub => ({
          ...sub,
          daysUntilBilling: Math.ceil(
            (sub.nextBilling!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      };
    });

    res.status(200).json({
      status: 'success',
      data: { statistics: stats },
    });
  });
}

// Helper function to calculate next billing date
function calculateNextBilling(startDate: Date, billingCycle: string): Date {
  const nextBilling = new Date(startDate);
  
  switch (billingCycle) {
    case 'WEEKLY':
      nextBilling.setDate(nextBilling.getDate() + 7);
      break;
    case 'MONTHLY':
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      break;
    case 'QUARTERLY':
      nextBilling.setMonth(nextBilling.getMonth() + 3);
      break;
    case 'YEARLY':
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      break;
  }
  
  // If calculated date is in the past, keep adding cycles until it's in the future
  const now = new Date();
  while (nextBilling <= now) {
    switch (billingCycle) {
      case 'WEEKLY':
        nextBilling.setDate(nextBilling.getDate() + 7);
        break;
      case 'MONTHLY':
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextBilling.setMonth(nextBilling.getMonth() + 3);
        break;
      case 'YEARLY':
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        break;
    }
  }
  
  return nextBilling;
}

export const subscriptionController = new SubscriptionController();