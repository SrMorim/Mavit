/**
 * Transaction Validation Schemas
 * Input validation rules for financial transactions using Joi
 */

import Joi from 'joi';
import { commonValidations } from '../middleware/validation';

const transactionTypes = ['INCOME', 'EXPENSE'] as const;
const categories = [
  'food', 'transport', 'housing', 'utilities', 'healthcare', 'education',
  'entertainment', 'shopping', 'travel', 'subscriptions', 'salary', 'freelance',
  'investment', 'gift', 'other'
] as const;

export const transactionValidation = {
  // Get transactions with filters and pagination
  getTransactions: Joi.object({
    page: commonValidations.pagination.extract('page'),
    limit: commonValidations.pagination.extract('limit'),
    sortBy: commonValidations.pagination.extract('sortBy'),
    sortOrder: commonValidations.pagination.extract('sortOrder'),
    type: Joi.string()
      .valid(...transactionTypes)
      .optional()
      .messages({
        'any.only': `Type must be one of: ${transactionTypes.join(', ')}`,
      }),
    category: Joi.string()
      .valid(...categories)
      .optional()
      .messages({
        'any.only': `Category must be one of: ${categories.join(', ')}`,
      }),
    dateFrom: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Date from must be in ISO format',
      }),
    dateTo: Joi.date()
      .iso()
      .min(Joi.ref('dateFrom'))
      .optional()
      .messages({
        'date.format': 'Date to must be in ISO format',
        'date.min': 'Date to must be after date from',
      }),
    minAmount: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Min amount must be non-negative',
      }),
    maxAmount: Joi.number()
      .min(Joi.ref('minAmount'))
      .optional()
      .messages({
        'number.min': 'Max amount must be greater than min amount',
      }),
    search: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Search query cannot exceed 100 characters',
      }),
  }),

  // Create transaction validation
  createTransaction: Joi.object({
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
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters',
      }),
    amount: Joi.number()
      .positive()
      .precision(2)
      .max(999999999.99)
      .required()
      .messages({
        'number.positive': 'Amount must be positive',
        'number.precision': 'Amount can have maximum 2 decimal places',
        'number.max': 'Amount is too large',
        'any.required': 'Amount is required',
      }),
    type: Joi.string()
      .valid(...transactionTypes)
      .required()
      .messages({
        'any.only': `Type must be one of: ${transactionTypes.join(', ')}`,
        'any.required': 'Type is required',
      }),
    category: Joi.string()
      .valid(...categories)
      .required()
      .messages({
        'any.only': `Category must be one of: ${categories.join(', ')}`,
        'any.required': 'Category is required',
      }),
    date: Joi.date()
      .iso()
      .max('now')
      .default(() => new Date())
      .messages({
        'date.format': 'Date must be in ISO format',
        'date.max': 'Date cannot be in the future',
      }),
    account: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Account name cannot exceed 100 characters',
      }),
    paymentMethod: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Payment method cannot exceed 100 characters',
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
    isRecurring: Joi.boolean()
      .default(false),
  }),

  // Update transaction validation
  updateTransaction: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters',
      }),
    amount: Joi.number()
      .positive()
      .precision(2)
      .max(999999999.99)
      .optional()
      .messages({
        'number.positive': 'Amount must be positive',
        'number.precision': 'Amount can have maximum 2 decimal places',
        'number.max': 'Amount is too large',
      }),
    type: Joi.string()
      .valid(...transactionTypes)
      .optional()
      .messages({
        'any.only': `Type must be one of: ${transactionTypes.join(', ')}`,
      }),
    category: Joi.string()
      .valid(...categories)
      .optional()
      .messages({
        'any.only': `Category must be one of: ${categories.join(', ')}`,
      }),
    date: Joi.date()
      .iso()
      .max('now')
      .optional()
      .messages({
        'date.format': 'Date must be in ISO format',
        'date.max': 'Date cannot be in the future',
      }),
    account: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Account name cannot exceed 100 characters',
      }),
    paymentMethod: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Payment method cannot exceed 100 characters',
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
    isRecurring: Joi.boolean()
      .optional(),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  // Bulk import validation
  bulkImport: Joi.object({
    transactions: Joi.array()
      .items(Joi.object({
        title: Joi.string().min(1).max(200).required(),
        amount: Joi.number().positive().precision(2).required(),
        type: Joi.string().valid(...transactionTypes).required(),
        category: Joi.string().valid(...categories).required(),
        date: Joi.date().iso().max('now').required(),
        description: Joi.string().max(500).optional(),
        account: Joi.string().max(100).optional(),
        paymentMethod: Joi.string().max(100).optional(),
        tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
      }))
      .min(1)
      .max(1000)
      .required()
      .messages({
        'array.min': 'At least one transaction is required',
        'array.max': 'Cannot import more than 1000 transactions at once',
      }),
  }),
};