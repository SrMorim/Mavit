/**
 * Subscription Validation Schemas
 * Input validation rules for subscription management using Joi
 */

import Joi from 'joi';
import { commonValidations } from '../middleware/validation';

const billingCycles = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
const currencies = ['BRL', 'USD', 'EUR'] as const;

export const subscriptionValidation = {
  // Get subscriptions with filters and pagination
  getSubscriptions: Joi.object({
    page: commonValidations.pagination.extract('page'),
    limit: commonValidations.pagination.extract('limit'),
    sortBy: commonValidations.pagination.extract('sortBy'),
    sortOrder: commonValidations.pagination.extract('sortOrder'),
    isActive: Joi.boolean()
      .optional(),
    billingCycle: Joi.string()
      .valid(...billingCycles)
      .optional()
      .messages({
        'any.only': `Billing cycle must be one of: ${billingCycles.join(', ')}`,
      }),
    category: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Category cannot exceed 100 characters',
      }),
    search: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Search query cannot exceed 100 characters',
      }),
  }),

  // Create subscription validation
  createSubscription: Joi.object({
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
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters',
      }),
    amount: Joi.number()
      .positive()
      .precision(2)
      .max(99999.99)
      .required()
      .messages({
        'number.positive': 'Amount must be positive',
        'number.precision': 'Amount can have maximum 2 decimal places',
        'number.max': 'Amount is too large',
        'any.required': 'Amount is required',
      }),
    currency: Joi.string()
      .valid(...currencies)
      .default('BRL')
      .messages({
        'any.only': `Currency must be one of: ${currencies.join(', ')}`,
      }),
    billingCycle: Joi.string()
      .valid(...billingCycles)
      .required()
      .messages({
        'any.only': `Billing cycle must be one of: ${billingCycles.join(', ')}`,
        'any.required': 'Billing cycle is required',
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
    category: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Category cannot exceed 100 characters',
      }),
    website: Joi.string()
      .uri()
      .max(500)
      .optional()
      .messages({
        'string.uri': 'Website must be a valid URL',
        'string.max': 'Website URL cannot exceed 500 characters',
      }),
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Notes cannot exceed 1000 characters',
      }),
  }),

  // Update subscription validation
  updateSubscription: Joi.object({
    name: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Name cannot be empty',
        'string.max': 'Name cannot exceed 200 characters',
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
      .max(99999.99)
      .optional()
      .messages({
        'number.positive': 'Amount must be positive',
        'number.precision': 'Amount can have maximum 2 decimal places',
        'number.max': 'Amount is too large',
      }),
    currency: Joi.string()
      .valid(...currencies)
      .optional()
      .messages({
        'any.only': `Currency must be one of: ${currencies.join(', ')}`,
      }),
    billingCycle: Joi.string()
      .valid(...billingCycles)
      .optional()
      .messages({
        'any.only': `Billing cycle must be one of: ${billingCycles.join(', ')}`,
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
    isActive: Joi.boolean()
      .optional(),
    category: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Category cannot exceed 100 characters',
      }),
    website: Joi.string()
      .uri()
      .max(500)
      .optional()
      .messages({
        'string.uri': 'Website must be a valid URL',
        'string.max': 'Website URL cannot exceed 500 characters',
      }),
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Notes cannot exceed 1000 characters',
      }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  // Cancel subscription validation
  cancelSubscription: Joi.object({
    cancelDate: Joi.date()
      .iso()
      .optional()
      .default(() => new Date())
      .messages({
        'date.format': 'Cancel date must be in ISO format',
      }),
    reason: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Cancellation reason cannot exceed 500 characters',
      }),
  }),
};