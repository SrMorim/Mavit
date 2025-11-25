/**
 * Synchronization Service
 * Handles inter-module synchronization and data consistency across Mavit modules
 */

import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { stringifyJsonArray } from '../utils/jsonArrayHelpers';

interface SyncEvent {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 
        'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_DELETED' |
        'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED';
  entityId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

class SyncService {
  // Process synchronization event
  async processSync(event: SyncEvent): Promise<void> {
    try {
      logger.info('Processing sync event:', {
        type: event.type,
        entityId: event.entityId,
        userId: event.userId,
      });

      switch (event.type) {
        case 'TASK_CREATED':
          await this.syncTaskToCalendar(event.entityId, event.userId, 'CREATE');
          break;
        case 'TASK_UPDATED':
          await this.syncTaskToCalendar(event.entityId, event.userId, 'UPDATE');
          break;
        case 'TASK_DELETED':
          await this.syncTaskToCalendar(event.entityId, event.userId, 'DELETE');
          break;
        case 'SUBSCRIPTION_CREATED':
          await this.createSubscriptionTransaction(event.entityId, event.userId);
          break;
        case 'SUBSCRIPTION_UPDATED':
          await this.updateSubscriptionTransactions(event.entityId, event.userId);
          break;
        default:
          logger.warn('Unknown sync event type:', event.type);
      }
    } catch (error) {
      logger.error('Sync processing failed:', error);
      throw error;
    }
  }

  // Sync task with calendar when it has a due date
  private async syncTaskToCalendar(taskId: string, userId: string, action: 'CREATE' | 'UPDATE' | 'DELETE'): Promise<void> {
    if (action === 'DELETE') {
      // Remove any synced calendar events
      await prisma.event.deleteMany({
        where: {
          userId,
          title: { contains: '[Task]' },
          // We'd need a way to link events to tasks - could add taskId field to Event model
        },
      });
      return;
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        status: true,
        priority: true,
        eventId: true, // If task is already linked to an event
      },
    });

    if (!task) {
      logger.warn('Task not found for sync:', { taskId, userId });
      return;
    }

    // Only sync tasks that have due dates
    if (!task.dueDate) {
      // If task had an event but no longer has due date, remove the event
      if (task.eventId) {
        await prisma.$transaction(async (tx) => {
          await tx.event.delete({
            where: { id: task.eventId! },
          });
          await tx.task.update({
            where: { id: taskId },
            data: { eventId: null },
          });
        });
      }
      return;
    }

    // Create or update calendar event
    if (task.eventId) {
      // Update existing event
      await prisma.event.update({
        where: { id: task.eventId },
        data: {
          title: `[Task] ${task.title}`,
          description: `Task: ${task.description || ''}\nPriority: ${task.priority}\nStatus: ${task.status}`,
          startDate: task.dueDate,
          endDate: new Date(task.dueDate.getTime() + 60 * 60 * 1000), // 1 hour duration
          allDay: false,
        },
      });
    } else {
      // Create new event
      const event = await prisma.event.create({
        data: {
          userId,
          title: `[Task] ${task.title}`,
          description: `Task: ${task.description || ''}\nPriority: ${task.priority}\nStatus: ${task.status}`,
          startDate: task.dueDate,
          endDate: new Date(task.dueDate.getTime() + 60 * 60 * 1000), // 1 hour duration
          allDay: false,
          color: this.getPriorityColor(task.priority),
        },
      });

      // Link task to event
      await prisma.task.update({
        where: { id: taskId },
        data: { eventId: event.id },
      });
    }

    logger.info('Task synced to calendar:', {
      taskId,
      eventId: task.eventId,
      action,
    });
  }

  // Create initial transaction for new subscription
  private async createSubscriptionTransaction(subscriptionId: string, userId: string): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
      select: {
        id: true,
        name: true,
        amount: true,
        startDate: true,
        billingCycle: true,
        isActive: true,
      },
    });

    if (!subscription || !subscription.isActive) {
      return;
    }

    // Check if start date is today or in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(subscription.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate <= today) {
      await prisma.transaction.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          title: `${subscription.name} - ${subscription.billingCycle.toLowerCase()} subscription`,
          description: `Subscription payment for ${subscription.name}`,
          amount: subscription.amount,
          type: 'EXPENSE',
          category: 'subscriptions',
          date: startDate,
          isRecurring: true,
        },
      });

      logger.info('Initial subscription transaction created:', {
        subscriptionId,
        amount: subscription.amount,
      });
    }
  }

  // Update subscription transactions when subscription changes
  private async updateSubscriptionTransactions(subscriptionId: string, userId: string): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      return;
    }

    // Update future recurring transactions
    await prisma.transaction.updateMany({
      where: {
        subscriptionId,
        date: { gt: new Date() },
        isRecurring: true,
      },
      data: {
        title: `${subscription.name} - ${subscription.billingCycle.toLowerCase()} subscription`,
        description: `Subscription payment for ${subscription.name}`,
        amount: subscription.amount,
      },
    });

    logger.info('Subscription transactions updated:', {
      subscriptionId,
      newAmount: subscription.amount,
    });
  }

  // Sync recurring subscription payments (to be called by scheduled job)
  async processRecurringSubscriptions(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get subscriptions that need billing today
    const subscriptionsToProcess = await prisma.subscription.findMany({
      where: {
        isActive: true,
        nextBilling: {
          lte: today,
        },
      },
      select: {
        id: true,
        userId: true,
        name: true,
        amount: true,
        billingCycle: true,
        nextBilling: true,
      },
    });

    for (const subscription of subscriptionsToProcess) {
      await prisma.$transaction(async (tx) => {
        // Create transaction
        await tx.transaction.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            title: `${subscription.name} - ${subscription.billingCycle.toLowerCase()} subscription`,
            description: `Recurring subscription payment for ${subscription.name}`,
            amount: subscription.amount,
            type: 'EXPENSE',
            category: 'subscriptions',
            date: today,
            isRecurring: true,
          },
        });

        // Update next billing date
        const nextBilling = this.calculateNextBilling(
          subscription.nextBilling!,
          subscription.billingCycle
        );

        await tx.subscription.update({
          where: { id: subscription.id },
          data: { nextBilling },
        });
      });

      logger.info('Recurring subscription processed:', {
        subscriptionId: subscription.id,
        amount: subscription.amount,
        nextBilling: subscription.nextBilling,
      });
    }

    logger.info(`Processed ${subscriptionsToProcess.length} recurring subscriptions`);
  }

  // Create reminder events for upcoming subscription billings
  async createSubscriptionReminders(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    // Get subscriptions billing in 3 days
    const upcomingSubscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true,
        nextBilling: {
          gte: threeDaysFromNow,
          lt: new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        userId: true,
        name: true,
        amount: true,
        nextBilling: true,
      },
    });

    for (const subscription of upcomingSubscriptions) {
      // Check if reminder already exists
      const existingReminder = await prisma.event.findFirst({
        where: {
          userId: subscription.userId,
          title: { contains: `[Billing] ${subscription.name}` },
          startDate: subscription.nextBilling!,
        },
      });

      if (!existingReminder) {
        await prisma.event.create({
          data: {
            userId: subscription.userId,
            title: `[Billing] ${subscription.name} - $${subscription.amount}`,
            description: `Subscription billing reminder for ${subscription.name}`,
            startDate: subscription.nextBilling!,
            endDate: new Date(subscription.nextBilling!.getTime() + 30 * 60 * 1000), // 30 min
            allDay: false,
            color: '#ef4444', // Red for billing reminders
            reminders: stringifyJsonArray([1440, 60]), // 1 day and 1 hour before
          },
        });

        logger.info('Subscription reminder created:', {
          subscriptionId: subscription.id,
          billingDate: subscription.nextBilling,
        });
      }
    }
  }

  // Helper method to get priority color for events
  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return '#dc2626'; // Red
      case 'HIGH':
        return '#ea580c'; // Orange
      case 'MEDIUM':
        return '#ef4444'; // Red (Mavit theme)
      case 'LOW':
        return '#6b7280'; // Gray
      default:
        return '#ef4444'; // Default Mavit red
    }
  }

  // Helper method to calculate next billing date
  private calculateNextBilling(currentBilling: Date, cycle: string): Date {
    const nextBilling = new Date(currentBilling);

    switch (cycle) {
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

    return nextBilling;
  }

  // Clean up orphaned sync relationships
  async cleanupOrphanedSyncs(): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Remove events linked to deleted tasks
      const orphanedEvents = await tx.event.findMany({
        where: {
          title: { contains: '[Task]' },
          // This would work better with a proper taskId reference
        },
      });

      // Remove task-event links where event no longer exists
      await tx.task.updateMany({
        where: {
          eventId: { not: null },
          event: null,
        },
        data: { eventId: null },
      });

      logger.info('Orphaned sync relationships cleaned up');
    });
  }

  // Get sync statistics
  async getSyncStatistics(userId: string): Promise<any> {
    const [
      tasksWithEvents,
      subscriptionsWithTransactions,
      upcomingReminders,
    ] = await Promise.all([
      prisma.task.count({
        where: {
          userId,
          eventId: { not: null },
        },
      }),
      prisma.subscription.count({
        where: {
          userId,
          isActive: true,
          transactions: { some: {} },
        },
      }),
      prisma.event.count({
        where: {
          userId,
          title: { contains: '[Billing]' },
          startDate: { gt: new Date() },
        },
      }),
    ]);

    return {
      tasksWithEvents,
      subscriptionsWithTransactions,
      upcomingReminders,
      lastSync: new Date().toISOString(),
    };
  }
}

export const syncService = new SyncService();