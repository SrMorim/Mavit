/**
 * Task Validation Schemas
 * Input validation rules for task (Backlog) endpoints using Joi
 */

import Joi from 'joi';
import { commonValidations } from '../middleware/validation';

const priorityValues = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const statusValues = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'] as const;

export const taskValidation = {
  // Get tasks with filters and pagination
  getTasks: Joi.object({
    page: commonValidations.pagination.extract('page'),
    limit: commonValidations.pagination.extract('limit'), 
    sortBy: commonValidations.pagination.extract('sortBy'),
    sortOrder: commonValidations.pagination.extract('sortOrder'),
    status: Joi.string()
      .valid(...statusValues)
      .optional()
      .messages({
        'any.only': `Status must be one of: ${statusValues.join(', ')}`,
      }),
    priority: Joi.string()
      .valid(...priorityValues)
      .optional()
      .messages({
        'any.only': `Priority must be one of: ${priorityValues.join(', ')}`,
      }),
    search: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Search query cannot exceed 100 characters',
      }),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .optional()
      .messages({
        'array.base': 'Tags must be an array',
        'string.max': 'Each tag cannot exceed 50 characters',
      }),
    dueDateFrom: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Due date from must be in ISO format',
      }),
    dueDateTo: Joi.date()
      .iso()
      .min(Joi.ref('dueDateFrom'))
      .optional()
      .messages({
        'date.format': 'Due date to must be in ISO format',
        'date.min': 'Due date to must be after due date from',
      }),
  }),

  // Create task validation
  createTask: Joi.object({
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
    priority: Joi.string()
      .valid(...priorityValues)
      .default('MEDIUM')
      .messages({
        'any.only': `Priority must be one of: ${priorityValues.join(', ')}`,
      }),
    dueDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Due date must be in ISO format',
      }),
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Start date must be in ISO format',
      }),
    tags: Joi.array()
      .items(
        Joi.string()
          .min(1)
          .max(50)
          .pattern(/^[a-zA-Z0-9\-_]+$/)
      )
      .max(10)
      .default([])
      .messages({
        'array.base': 'Tags must be an array',
        'array.max': 'Cannot have more than 10 tags',
        'string.min': 'Tag cannot be empty',
        'string.max': 'Each tag cannot exceed 50 characters',
        'string.pattern.base': 'Tags can only contain letters, numbers, hyphens, and underscores',
      }),
    estimatedHours: Joi.number()
      .integer()
      .min(1)
      .max(999)
      .optional()
      .messages({
        'number.base': 'Estimated hours must be a number',
        'number.integer': 'Estimated hours must be an integer',
        'number.min': 'Estimated hours must be at least 1',
        'number.max': 'Estimated hours cannot exceed 999',
      }),
  }),

  // Update task validation
  updateTask: Joi.object({
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
    priority: Joi.string()
      .valid(...priorityValues)
      .optional()
      .messages({
        'any.only': `Priority must be one of: ${priorityValues.join(', ')}`,
      }),
    status: Joi.string()
      .valid(...statusValues)
      .optional()
      .messages({
        'any.only': `Status must be one of: ${statusValues.join(', ')}`,
      }),
    dueDate: Joi.date()
      .iso()
      .optional()
      .allow(null)
      .messages({
        'date.format': 'Due date must be in ISO format',
      }),
    startDate: Joi.date()
      .iso()
      .optional()
      .allow(null)
      .messages({
        'date.format': 'Start date must be in ISO format',
      }),
    tags: Joi.array()
      .items(
        Joi.string()
          .min(1)
          .max(50)
          .pattern(/^[a-zA-Z0-9\-_]+$/)
      )
      .max(10)
      .optional()
      .messages({
        'array.base': 'Tags must be an array',
        'array.max': 'Cannot have more than 10 tags',
        'string.min': 'Tag cannot be empty',
        'string.max': 'Each tag cannot exceed 50 characters',
        'string.pattern.base': 'Tags can only contain letters, numbers, hyphens, and underscores',
      }),
    estimatedHours: Joi.number()
      .integer()
      .min(1)
      .max(999)
      .optional()
      .allow(null)
      .messages({
        'number.base': 'Estimated hours must be a number',
        'number.integer': 'Estimated hours must be an integer',
        'number.min': 'Estimated hours must be at least 1',
        'number.max': 'Estimated hours cannot exceed 999',
      }),
    actualHours: Joi.number()
      .integer()
      .min(1)
      .max(999)
      .optional()
      .allow(null)
      .messages({
        'number.base': 'Actual hours must be a number',
        'number.integer': 'Actual hours must be an integer',
        'number.min': 'Actual hours must be at least 1',
        'number.max': 'Actual hours cannot exceed 999',
      }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  // Batch operations validation
  batchUpdate: Joi.object({
    taskIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .max(50)
      .required()
      .messages({
        'array.base': 'Task IDs must be an array',
        'array.min': 'At least one task ID is required',
        'array.max': 'Cannot update more than 50 tasks at once',
        'string.guid': 'Each task ID must be a valid UUID',
      }),
    updates: Joi.object({
      status: Joi.string()
        .valid(...statusValues)
        .optional(),
      priority: Joi.string()
        .valid(...priorityValues)
        .optional(),
      tags: Joi.array()
        .items(Joi.string().max(50))
        .optional(),
    }).min(1).messages({
      'object.min': 'At least one update field must be provided',
    }),
  }),
};