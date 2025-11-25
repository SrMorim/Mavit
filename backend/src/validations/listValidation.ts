/**
 * List Validation Schemas (Listas Module)
 * Input validation rules for lists and list items using Joi
 */

import Joi from 'joi';
import { commonValidations } from '../middleware/validation';

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as const;
const colors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#dc2626'
] as const;

export const listValidation = {
  // Get lists with filters and pagination
  getLists: Joi.object({
    page: commonValidations.pagination.extract('page'),
    limit: commonValidations.pagination.extract('limit'),
    sortBy: commonValidations.pagination.extract('sortBy'),
    sortOrder: commonValidations.pagination.extract('sortOrder'),
    search: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Search query cannot exceed 100 characters',
      }),
    isArchived: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is archived must be true or false',
      }),
    color: Joi.string()
      .optional()
      .messages({
        'string.base': 'Color must be a valid hex color',
      }),
  }),

  // Create list validation
  createList: Joi.object({
    name: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Name cannot be empty',
        'string.max': 'Name cannot exceed 200 characters',
        'any.required': 'Name is required',
      }),
    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 1000 characters',
      }),
    color: Joi.string()
      .pattern(/^#[0-9a-fA-F]{6}$/)
      .default('#3b82f6')
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #3b82f6)',
      }),
    isShared: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Is shared must be true or false',
      }),
  }),

  // Update list validation
  updateList: Joi.object({
    name: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Name cannot be empty',
        'string.max': 'Name cannot exceed 200 characters',
      }),
    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 1000 characters',
      }),
    color: Joi.string()
      .pattern(/^#[0-9a-fA-F]{6}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #3b82f6)',
      }),
    isShared: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is shared must be true or false',
      }),
    isArchived: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is archived must be true or false',
      }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  // Get list items with filters and pagination
  getListItems: Joi.object({
    page: commonValidations.pagination.extract('page'),
    limit: commonValidations.pagination.extract('limit'),
    sortBy: commonValidations.pagination.extract('sortBy'),
    sortOrder: commonValidations.pagination.extract('sortOrder'),
    isCompleted: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is completed must be true or false',
      }),
    priority: Joi.string()
      .valid(...priorities)
      .optional()
      .messages({
        'any.only': `Priority must be one of: ${priorities.join(', ')}`,
      }),
    search: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Search query cannot exceed 100 characters',
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

  // Create list item validation
  createListItem: Joi.object({
    title: Joi.string()
      .min(1)
      .max(300)
      .required()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 300 characters',
        'any.required': 'Title is required',
      }),
    notes: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Notes cannot exceed 2000 characters',
      }),
    priority: Joi.string()
      .valid(...priorities)
      .default('MEDIUM')
      .optional()
      .messages({
        'any.only': `Priority must be one of: ${priorities.join(', ')}`,
      }),
    dueDate: Joi.date()
      .iso()
      .min('now')
      .optional()
      .messages({
        'date.format': 'Due date must be in ISO format',
        'date.min': 'Due date must be in the future',
      }),
  }),

  // Update list item validation
  updateListItem: Joi.object({
    title: Joi.string()
      .min(1)
      .max(300)
      .optional()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 300 characters',
      }),
    notes: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Notes cannot exceed 2000 characters',
      }),
    priority: Joi.string()
      .valid(...priorities)
      .optional()
      .messages({
        'any.only': `Priority must be one of: ${priorities.join(', ')}`,
      }),
    isCompleted: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is completed must be true or false',
      }),
    dueDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Due date must be in ISO format',
      }),
    order: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        'number.base': 'Order must be a number',
        'number.integer': 'Order must be an integer',
        'number.min': 'Order must be non-negative',
      }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  // Bulk operations on list items
  bulkUpdateItems: Joi.object({
    itemIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.base': 'Item IDs must be an array',
        'array.min': 'At least one item ID is required',
        'array.max': 'Cannot update more than 100 items at once',
        'string.guid': 'Each item ID must be a valid UUID',
      }),
    updates: Joi.object({
      isCompleted: Joi.boolean()
        .optional(),
      priority: Joi.string()
        .valid(...priorities)
        .optional(),
      dueDate: Joi.date()
        .iso()
        .optional(),
    }).min(1).messages({
      'object.min': 'At least one update field must be provided',
    }),
  }),

  // Reorder list items
  reorderItems: Joi.object({
    itemIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .max(1000)
      .required()
      .messages({
        'array.base': 'Item IDs must be an array',
        'array.min': 'At least one item ID is required',
        'array.max': 'Cannot reorder more than 1000 items at once',
        'string.guid': 'Each item ID must be a valid UUID',
      }),
  }),

  // Template creation for lists
  createFromTemplate: Joi.object({
    templateType: Joi.string()
      .valid('daily-checklist', 'weekly-goals', 'project-tasks', 'shopping-list', 'travel-checklist')
      .required()
      .messages({
        'any.only': 'Template type must be one of: daily-checklist, weekly-goals, project-tasks, shopping-list, travel-checklist',
        'any.required': 'Template type is required',
      }),
    title: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required',
      }),
    customItems: Joi.array()
      .items(Joi.string().min(1).max(300))
      .max(50)
      .optional()
      .messages({
        'array.base': 'Custom items must be an array',
        'array.max': 'Cannot have more than 50 custom items',
        'string.min': 'Each item cannot be empty',
        'string.max': 'Each item cannot exceed 300 characters',
      }),
  }),

  // Share list with others
  shareList: Joi.object({
    emails: Joi.array()
      .items(Joi.string().email())
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.base': 'Emails must be an array',
        'array.min': 'At least one email is required',
        'array.max': 'Cannot share with more than 10 people at once',
        'string.email': 'Each email must be a valid email address',
        'any.required': 'Emails are required',
      }),
    permission: Joi.string()
      .valid('READ', 'WRITE')
      .default('READ')
      .messages({
        'any.only': 'Permission must be READ or WRITE',
      }),
    message: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Message cannot exceed 500 characters',
      }),
  }),

  // Import list items from external sources
  importItems: Joi.object({
    format: Joi.string()
      .valid('csv', 'json', 'plain-text')
      .required()
      .messages({
        'any.only': 'Format must be one of: csv, json, plain-text',
        'any.required': 'Format is required',
      }),
    data: Joi.string()
      .min(1)
      .max(1000000) // 1MB text limit
      .required()
      .messages({
        'string.min': 'Data cannot be empty',
        'string.max': 'Data cannot exceed 1MB',
        'any.required': 'Data is required',
      }),
    overwrite: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Overwrite must be true or false',
      }),
  }),
};