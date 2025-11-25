/**
 * Event Validation Schemas (Calendar Module)
 * Input validation rules for calendar events using Joi
 */

import Joi from 'joi';
import { commonValidations } from '../middleware/validation';

const recurrenceTypes = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'] as const;
const colors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#dc2626'
] as const;

export const eventValidation = {
  // Get events with filters and pagination
  getEvents: Joi.object({
    page: commonValidations.pagination.extract('page'),
    limit: commonValidations.pagination.extract('limit'),
    sortBy: commonValidations.pagination.extract('sortBy'),
    sortOrder: commonValidations.pagination.extract('sortOrder'),
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Start date must be in ISO format',
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': 'End date must be in ISO format',
        'date.min': 'End date must be after start date',
      }),
    search: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Search query cannot exceed 100 characters',
      }),
    view: Joi.string()
      .valid('day', 'week', 'month', 'year')
      .default('month')
      .optional()
      .messages({
        'any.only': 'View must be one of: day, week, month, year',
      }),
    color: Joi.string()
      .optional()
      .messages({
        'string.base': 'Color must be a valid hex color',
      }),
  }),

  // Create event validation
  createEvent: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required',
      }),
    description: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 2000 characters',
      }),
    startDate: Joi.date()
      .iso()
      .required()
      .messages({
        'date.format': 'Start date must be in ISO format',
        'any.required': 'Start date is required',
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': 'End date must be in ISO format',
        'date.min': 'End date must be after start date',
      }),
    allDay: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'All day must be true or false',
      }),
    location: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Location cannot exceed 500 characters',
      }),
    color: Joi.string()
      .pattern(/^#[0-9a-fA-F]{6}$/)
      .default('#ef4444')
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #ef4444)',
      }),
    isRecurring: Joi.boolean()
      .default(false),
    recurrence: Joi.string()
      .valid(...recurrenceTypes)
      .when('isRecurring', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        'any.only': `Recurrence must be one of: ${recurrenceTypes.join(', ')}`,
        'any.required': 'Recurrence is required when event is recurring',
      }),
    reminders: Joi.array()
      .items(
        Joi.number()
          .integer()
          .min(0)
          .max(43200) // Max 30 days in minutes
      )
      .max(5)
      .default([15])
      .messages({
        'array.base': 'Reminders must be an array',
        'array.max': 'Cannot have more than 5 reminders',
        'number.min': 'Reminder minutes must be non-negative',
        'number.max': 'Reminder cannot be more than 30 days (43200 minutes)',
      }),
  }),

  // Update event validation
  updateEvent: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
      }),
    description: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 2000 characters',
      }),
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Start date must be in ISO format',
      }),
    endDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'End date must be in ISO format',
      }),
    allDay: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'All day must be true or false',
      }),
    location: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Location cannot exceed 500 characters',
      }),
    color: Joi.string()
      .pattern(/^#[0-9a-fA-F]{6}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #ef4444)',
      }),
    isRecurring: Joi.boolean()
      .optional(),
    recurrence: Joi.string()
      .valid(...recurrenceTypes)
      .optional()
      .messages({
        'any.only': `Recurrence must be one of: ${recurrenceTypes.join(', ')}`,
      }),
    reminders: Joi.array()
      .items(
        Joi.number()
          .integer()
          .min(0)
          .max(43200)
      )
      .max(5)
      .optional()
      .messages({
        'array.base': 'Reminders must be an array',
        'array.max': 'Cannot have more than 5 reminders',
        'number.min': 'Reminder minutes must be non-negative',
        'number.max': 'Reminder cannot be more than 30 days (43200 minutes)',
      }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  // Calendar view validation
  calendarView: Joi.object({
    view: Joi.string()
      .valid('day', 'week', 'month', 'year')
      .default('month')
      .messages({
        'any.only': 'View must be one of: day, week, month, year',
      }),
    date: Joi.date()
      .iso()
      .default(() => new Date())
      .messages({
        'date.format': 'Date must be in ISO format',
      }),
  }),

  // Bulk event operations
  bulkUpdate: Joi.object({
    eventIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .max(50)
      .required()
      .messages({
        'array.base': 'Event IDs must be an array',
        'array.min': 'At least one event ID is required',
        'array.max': 'Cannot update more than 50 events at once',
        'string.guid': 'Each event ID must be a valid UUID',
      }),
    updates: Joi.object({
      color: Joi.string()
        .pattern(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      reminders: Joi.array()
        .items(Joi.number().integer().min(0).max(43200))
        .max(5)
        .optional(),
    }).min(1).messages({
      'object.min': 'At least one update field must be provided',
    }),
  }),

  // Import events validation (e.g., from .ics files)
  importEvents: Joi.object({
    events: Joi.array()
      .items(Joi.object({
        title: Joi.string().min(1).max(200).required(),
        description: Joi.string().max(2000).optional(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().optional(),
        allDay: Joi.boolean().default(false),
        location: Joi.string().max(500).optional(),
        color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).optional(),
      }))
      .min(1)
      .max(1000)
      .required()
      .messages({
        'array.min': 'At least one event is required',
        'array.max': 'Cannot import more than 1000 events at once',
      }),
    overwrite: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Overwrite must be true or false',
      }),
  }),
};