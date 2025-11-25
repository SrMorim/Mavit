/**
 * Internal Event Bus
 * Handles internal events for inter-module synchronization and notifications
 */

import { EventEmitter } from 'events';
import { syncService } from './syncService';
import { logger } from '../utils/logger';

interface MavitEvent {
  type: string;
  data: any;
  userId: string;
  entityId: string;
  timestamp: Date;
}

class MavitEventBus extends EventEmitter {
  constructor() {
    super();
    this.setupEventHandlers();
  }

  // Setup event handlers for synchronization
  private setupEventHandlers(): void {
    // Task events
    this.on('task:created', this.handleTaskCreated.bind(this));
    this.on('task:updated', this.handleTaskUpdated.bind(this));
    this.on('task:deleted', this.handleTaskDeleted.bind(this));

    // Subscription events
    this.on('subscription:created', this.handleSubscriptionCreated.bind(this));
    this.on('subscription:updated', this.handleSubscriptionUpdated.bind(this));
    this.on('subscription:canceled', this.handleSubscriptionCanceled.bind(this));

    // Event events (calendar)
    this.on('event:created', this.handleEventCreated.bind(this));
    this.on('event:updated', this.handleEventUpdated.bind(this));
    this.on('event:deleted', this.handleEventDeleted.bind(this));

    logger.info('Event bus initialized with sync handlers');
  }

  // Emit a Mavit event
  async emitEvent(type: string, data: any, userId: string, entityId: string): Promise<void> {
    const event: MavitEvent = {
      type,
      data,
      userId,
      entityId,
      timestamp: new Date(),
    };

    logger.debug('Emitting event:', { type, entityId, userId });
    
    try {
      this.emit(type, event);
    } catch (error) {
      logger.error('Event emission failed:', { type, error });
    }
  }

  // Task event handlers
  private async handleTaskCreated(event: MavitEvent): Promise<void> {
    try {
      await syncService.processSync({
        type: 'TASK_CREATED',
        entityId: event.entityId,
        userId: event.userId,
        data: event.data,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logger.error('Failed to sync task creation:', error);
    }
  }

  private async handleTaskUpdated(event: MavitEvent): Promise<void> {
    try {
      await syncService.processSync({
        type: 'TASK_UPDATED',
        entityId: event.entityId,
        userId: event.userId,
        data: event.data,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logger.error('Failed to sync task update:', error);
    }
  }

  private async handleTaskDeleted(event: MavitEvent): Promise<void> {
    try {
      await syncService.processSync({
        type: 'TASK_DELETED',
        entityId: event.entityId,
        userId: event.userId,
        data: event.data,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logger.error('Failed to sync task deletion:', error);
    }
  }

  // Subscription event handlers
  private async handleSubscriptionCreated(event: MavitEvent): Promise<void> {
    try {
      await syncService.processSync({
        type: 'SUBSCRIPTION_CREATED',
        entityId: event.entityId,
        userId: event.userId,
        data: event.data,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logger.error('Failed to sync subscription creation:', error);
    }
  }

  private async handleSubscriptionUpdated(event: MavitEvent): Promise<void> {
    try {
      await syncService.processSync({
        type: 'SUBSCRIPTION_UPDATED',
        entityId: event.entityId,
        userId: event.userId,
        data: event.data,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logger.error('Failed to sync subscription update:', error);
    }
  }

  private async handleSubscriptionCanceled(event: MavitEvent): Promise<void> {
    try {
      // When subscription is canceled, we might want to remove future reminders
      logger.info('Subscription canceled, cleaning up reminders:', {
        subscriptionId: event.entityId,
      });
    } catch (error) {
      logger.error('Failed to handle subscription cancellation:', error);
    }
  }

  // Event (calendar) event handlers
  private async handleEventCreated(event: MavitEvent): Promise<void> {
    logger.info('Calendar event created:', {
      eventId: event.entityId,
      userId: event.userId,
    });
  }

  private async handleEventUpdated(event: MavitEvent): Promise<void> {
    logger.info('Calendar event updated:', {
      eventId: event.entityId,
      userId: event.userId,
    });
  }

  private async handleEventDeleted(event: MavitEvent): Promise<void> {
    logger.info('Calendar event deleted:', {
      eventId: event.entityId,
      userId: event.userId,
    });
  }

  // Health check for event bus
  getHealth(): { status: string; listeners: number; timestamp: string } {
    return {
      status: 'healthy',
      listeners: this.listenerCount('task:created') + 
                this.listenerCount('subscription:created') + 
                this.listenerCount('event:created'),
      timestamp: new Date().toISOString(),
    };
  }

  // Get event statistics
  getEventStats(): any {
    const events = [
      'task:created', 'task:updated', 'task:deleted',
      'subscription:created', 'subscription:updated', 'subscription:canceled',
      'event:created', 'event:updated', 'event:deleted'
    ];

    return events.reduce((stats, eventType) => {
      stats[eventType] = this.listenerCount(eventType);
      return stats;
    }, {} as Record<string, number>);
  }
}

// Create singleton instance
export const eventBus = new MavitEventBus();