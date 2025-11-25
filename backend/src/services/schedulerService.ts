/**
 * Scheduler Service
 * Handles scheduled tasks for recurring operations like subscription billing,
 * reminder notifications, and cleanup jobs
 */

import { syncService } from './syncService';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

class SchedulerService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  // Start all scheduled jobs
  start(): void {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting Mavit scheduler service');

    // Daily job - 6 AM
    this.scheduleDaily('daily-sync', this.dailySync.bind(this), 6);
    
    // Hourly job
    this.scheduleInterval('hourly-reminders', this.hourlyReminders.bind(this), 60 * 60 * 1000);
    
    // Every 15 minutes - cleanup and health checks
    this.scheduleInterval('cleanup', this.cleanupJobs.bind(this), 15 * 60 * 1000);

    // Every 5 minutes - process subscription billings
    this.scheduleInterval('subscription-billing', this.processSubscriptionBilling.bind(this), 5 * 60 * 1000);

    logger.info('All scheduled jobs started successfully');
  }

  // Stop all scheduled jobs
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    logger.info('Stopping Mavit scheduler service');

    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      logger.info(`Stopped job: ${name}`);
    });

    this.intervals.clear();
    logger.info('All scheduled jobs stopped');
  }

  // Schedule a job to run daily at specific hour
  private scheduleDaily(name: string, job: () => Promise<void>, hour: number): void {
    const runDaily = async () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, 0, 0, 0);

      // If we've passed the scheduled time today, schedule for tomorrow
      if (now >= scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          await job();
        } catch (error) {
          logger.error(`Daily job ${name} failed:`, error);
        }

        // Schedule next run (24 hours)
        const interval = setInterval(async () => {
          try {
            await job();
          } catch (error) {
            logger.error(`Daily job ${name} failed:`, error);
          }
        }, 24 * 60 * 60 * 1000);

        this.intervals.set(name, interval);
      }, delay);
    };

    runDaily();
  }

  // Schedule a job to run at intervals
  private scheduleInterval(name: string, job: () => Promise<void>, intervalMs: number): void {
    const interval = setInterval(async () => {
      try {
        await job();
      } catch (error) {
        logger.error(`Interval job ${name} failed:`, error);
      }
    }, intervalMs);

    this.intervals.set(name, interval);
    logger.info(`Scheduled job: ${name} (every ${intervalMs}ms)`);
  }

  // Daily sync job - runs comprehensive synchronization
  private async dailySync(): Promise<void> {
    logger.info('Starting daily sync job');

    try {
      // Process recurring subscriptions
      await syncService.processRecurringSubscriptions();

      // Create subscription reminders for upcoming billings
      await syncService.createSubscriptionReminders();

      // Clean up orphaned sync relationships
      await syncService.cleanupOrphanedSyncs();

      // Clean up old user sessions (older than 30 days)
      await this.cleanupOldSessions();

      // Generate daily analytics snapshot (if needed)
      await this.generateDailySnapshot();

      logger.info('Daily sync job completed successfully');
    } catch (error) {
      logger.error('Daily sync job failed:', error);
    }
  }

  // Hourly reminders job
  private async hourlyReminders(): Promise<void> {
    logger.debug('Processing hourly reminders');

    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find events with reminders in the next hour
      const eventsWithReminders = await prisma.event.findMany({
        where: {
          startDate: {
            gte: now,
            lte: oneHourFromNow,
          },
          reminders: {
            contains: "60", // Has 60-minute reminder
          },
        },
        select: {
          id: true,
          userId: true,
          title: true,
          startDate: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      for (const event of eventsWithReminders) {
        // Here you would integrate with email/push notification service
        logger.info('Reminder needed:', {
          eventId: event.id,
          userId: event.userId,
          title: event.title,
          startDate: event.startDate,
        });

        // TODO: Send actual notification
        // await notificationService.sendReminder(event);
      }

      logger.debug(`Processed ${eventsWithReminders.length} hourly reminders`);
    } catch (error) {
      logger.error('Hourly reminders job failed:', error);
    }
  }

  // Cleanup jobs - runs every 15 minutes
  private async cleanupJobs(): Promise<void> {
    logger.debug('Running cleanup jobs');

    try {
      // Clean up expired user sessions
      const expiredSessions = await prisma.userSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (expiredSessions.count > 0) {
        logger.info(`Cleaned up ${expiredSessions.count} expired sessions`);
      }

      // Clean up old temporary data (if any)
      // This could include file uploads, temporary tokens, etc.

      logger.debug('Cleanup jobs completed');
    } catch (error) {
      logger.error('Cleanup jobs failed:', error);
    }
  }

  // Process subscription billing
  private async processSubscriptionBilling(): Promise<void> {
    logger.debug('Processing subscription billing');

    try {
      await syncService.processRecurringSubscriptions();
    } catch (error) {
      logger.error('Subscription billing processing failed:', error);
    }
  }

  // Clean up old user sessions
  private async cleanupOldSessions(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedSessions = await prisma.userSession.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    if (deletedSessions.count > 0) {
      logger.info(`Cleaned up ${deletedSessions.count} old sessions`);
    }
  }

  // Generate daily analytics snapshot
  private async generateDailySnapshot(): Promise<void> {
    logger.debug('Generating daily analytics snapshot');

    // This could store daily summaries for performance optimization
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Example: Count daily stats per user for caching
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        user_id,
        COUNT(CASE WHEN type = 'INCOME' THEN 1 END) as income_transactions,
        COUNT(CASE WHEN type = 'EXPENSE' THEN 1 END) as expense_transactions,
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expense
      FROM transactions
      WHERE DATE(created_at) = DATE(${today})
      GROUP BY user_id
    `;

    logger.debug(`Generated snapshot for ${(dailyStats as any[]).length} users`);
  }

  // Get scheduler health status
  getHealth(): any {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.intervals.keys()),
      jobCount: this.intervals.size,
      timestamp: new Date().toISOString(),
    };
  }

  // Get job statistics
  getJobStats(): any {
    const stats: any = {
      isRunning: this.isRunning,
      totalJobs: this.intervals.size,
      jobs: {},
    };

    this.intervals.forEach((interval, name) => {
      stats.jobs[name] = {
        active: true,
        // In a real implementation, you might track execution times, errors, etc.
      };
    });

    return stats;
  }

  // Manual trigger for jobs (useful for testing)
  async runJob(jobName: string): Promise<void> {
    switch (jobName) {
      case 'daily-sync':
        await this.dailySync();
        break;
      case 'hourly-reminders':
        await this.hourlyReminders();
        break;
      case 'cleanup':
        await this.cleanupJobs();
        break;
      case 'subscription-billing':
        await this.processSubscriptionBilling();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}

// Create singleton instance
export const schedulerService = new SchedulerService();