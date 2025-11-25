/**
 * Request Validation Middleware
 * Validates incoming request data using Joi schemas
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler';

// Validation options
const validationOptions: Joi.ValidationOptions = {
  abortEarly: false, // Return all validation errors
  allowUnknown: false, // Don't allow unknown keys
  stripUnknown: true, // Remove unknown keys if allowUnknown is true
  errors: {
    wrap: {
      label: false, // Don't wrap field names in quotes
    },
  },
};

// Main validation middleware factory
export const validateRequest = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], validationOptions);

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      const validationError = new ValidationError(
        'Validation failed',
        errorDetails
      );

      next(validationError);
      return;
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Validate request body
export const validateBody = (schema: Joi.ObjectSchema) => {
  return validateRequest(schema, 'body');
};

// Validate query parameters
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validateRequest(schema, 'query');
};

// Validate URL parameters
export const validateParams = (schema: Joi.ObjectSchema) => {
  return validateRequest(schema, 'params');
};

// Common validation schemas
export const commonValidations = {
  // UUID validation
  uuid: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.guid': 'Invalid ID format',
      'any.required': 'ID is required',
    }),

  // Optional UUID validation
  optionalUuid: Joi.string()
    .uuid({ version: 'uuidv4' })
    .optional()
    .messages({
      'string.guid': 'Invalid ID format',
    }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
      }),
    sortBy: Joi.string()
      .optional()
      .messages({
        'string.base': 'Sort by must be a string',
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'Sort order must be either "asc" or "desc"',
      }),
  }),

  // Search
  search: Joi.object({
    q: Joi.string()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Search query must not be empty',
        'string.max': 'Search query cannot exceed 100 characters',
      }),
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
        'date.min': 'End date must be after start date',
      }),
  }),

  // ID parameter validation
  idParam: Joi.object({
    id: Joi.string()
      .uuid({ version: 'uuidv4' })
      .required()
      .messages({
        'string.guid': 'Invalid ID format',
        'any.required': 'ID is required',
      }),
  }),
};

// File upload validation (for future use)
// Note: This requires multer middleware to be installed and configured
export const validateFileUpload = (
  allowedMimes: string[] = ['image/jpeg', 'image/png', 'image/gif'],
  maxSize: number = 5 * 1024 * 1024 // 5MB
) => {
  return (req: Request & { file?: any }, res: Response, next: NextFunction): void => {
    if (!req.file) {
      next(new ValidationError('File is required'));
      return;
    }

    // Check file type
    if (!allowedMimes.includes(req.file.mimetype)) {
      next(new ValidationError(
        `Invalid file type. Allowed types: ${allowedMimes.join(', ')}`
      ));
      return;
    }

    // Check file size
    if (req.file.size > maxSize) {
      next(new ValidationError(
        `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      ));
      return;
    }

    next();
  };
};

// Sanitize HTML content (prevent XSS)
export const sanitizeHtml = (value: string): string => {
  if (typeof value !== 'string') return value;
  
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Custom Joi extension for HTML sanitization
const customJoi = Joi.extend({
  type: 'string',
  base: Joi.string(),
  messages: {
    'string.htmlSanitized': '{{#label}} contains potentially unsafe HTML',
  },
  rules: {
    htmlSafe: {
      method() {
        return this.$_addRule({
          name: 'htmlSafe',
          validate: (value: string, helpers: any) => {
            const sanitized = sanitizeHtml(value);
            return sanitized;
          },
        });
      },
    },
  },
});

export { customJoi as Joi };

// Export validate as an alias for validateRequest for backward compatibility
export const validate = validateRequest;