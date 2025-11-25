/**
 * Note Validation Schemas (Bloco de Notas Module)
 * Input validation rules for notes with rich text content using Joi
 */

import Joi from 'joi';
import { commonValidations } from '../middleware/validation';

const colors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#dc2626',
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1'
] as const;

export const noteValidation = {
  // Get notes with filters and pagination
  getNotes: Joi.object({
    page: commonValidations.pagination.extract('page'),
    limit: commonValidations.pagination.extract('limit'),
    sortBy: commonValidations.pagination.extract('sortBy'),
    sortOrder: commonValidations.pagination.extract('sortOrder'),
    search: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Search query cannot exceed 200 characters',
      }),
    isArchived: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is archived must be true or false',
      }),
    isPinned: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is pinned must be true or false',
      }),
    category: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Category cannot exceed 100 characters',
      }),
    color: Joi.string()
      .optional()
      .messages({
        'string.base': 'Color must be a valid hex color',
      }),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .optional()
      .messages({
        'array.base': 'Tags must be an array',
        'array.max': 'Cannot filter by more than 20 tags',
        'string.max': 'Each tag cannot exceed 50 characters',
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
  }),

  // Create note validation
  createNote: Joi.object({
    title: Joi.string()
      .max(300)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Title cannot exceed 300 characters',
      }),
    content: Joi.string()
      .max(10000000) // 10MB text limit for rich content
      .required()
      .messages({
        'string.max': 'Content cannot exceed 10MB',
        'any.required': 'Content is required',
      }),
    plainTextContent: Joi.string()
      .max(1000000) // 1MB plain text for search
      .optional()
      .allow('')
      .messages({
        'string.max': 'Plain text content cannot exceed 1MB',
      }),
    category: Joi.string()
      .max(100)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Category cannot exceed 100 characters',
      }),
    color: Joi.string()
      .pattern(/^#[0-9a-fA-F]{6}$/)
      .default('#ffffff')
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #ffffff)',
      }),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .default([])
      .optional()
      .messages({
        'array.base': 'Tags must be an array',
        'array.max': 'Cannot have more than 20 tags',
        'string.max': 'Each tag cannot exceed 50 characters',
      }),
    isPinned: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Is pinned must be true or false',
      }),
    isTemplate: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Is template must be true or false',
      }),
    reminderDate: Joi.date()
      .iso()
      .min('now')
      .optional()
      .messages({
        'date.format': 'Reminder date must be in ISO format',
        'date.min': 'Reminder date must be in the future',
      }),
  }),

  // Update note validation
  updateNote: Joi.object({
    title: Joi.string()
      .max(300)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Title cannot exceed 300 characters',
      }),
    content: Joi.string()
      .max(10000000)
      .optional()
      .messages({
        'string.max': 'Content cannot exceed 10MB',
      }),
    plainTextContent: Joi.string()
      .max(1000000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Plain text content cannot exceed 1MB',
      }),
    category: Joi.string()
      .max(100)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Category cannot exceed 100 characters',
      }),
    color: Joi.string()
      .pattern(/^#[0-9a-fA-F]{6}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #ffffff)',
      }),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .optional()
      .messages({
        'array.base': 'Tags must be an array',
        'array.max': 'Cannot have more than 20 tags',
        'string.max': 'Each tag cannot exceed 50 characters',
      }),
    isPinned: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is pinned must be true or false',
      }),
    isArchived: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is archived must be true or false',
      }),
    isTemplate: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Is template must be true or false',
      }),
    reminderDate: Joi.date()
      .iso()
      .optional()
      .allow(null)
      .messages({
        'date.format': 'Reminder date must be in ISO format',
      }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  // Bulk operations on notes
  bulkUpdateNotes: Joi.object({
    noteIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.base': 'Note IDs must be an array',
        'array.min': 'At least one note ID is required',
        'array.max': 'Cannot update more than 100 notes at once',
        'string.guid': 'Each note ID must be a valid UUID',
      }),
    updates: Joi.object({
      category: Joi.string()
        .max(100)
        .optional()
        .allow(''),
      color: Joi.string()
        .pattern(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      tags: Joi.array()
        .items(Joi.string().max(50))
        .max(20)
        .optional(),
      isPinned: Joi.boolean()
        .optional(),
      isArchived: Joi.boolean()
        .optional(),
    }).min(1).messages({
      'object.min': 'At least one update field must be provided',
    }),
  }),

  // Share note with others
  shareNote: Joi.object({
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
    expiresAt: Joi.date()
      .iso()
      .min('now')
      .optional()
      .messages({
        'date.format': 'Expiration date must be in ISO format',
        'date.min': 'Expiration date must be in the future',
      }),
    message: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Message cannot exceed 500 characters',
      }),
  }),

  // Export notes in various formats
  exportNotes: Joi.object({
    noteIds: Joi.array()
      .items(Joi.string().uuid())
      .min(1)
      .max(500)
      .required()
      .messages({
        'array.base': 'Note IDs must be an array',
        'array.min': 'At least one note ID is required',
        'array.max': 'Cannot export more than 500 notes at once',
        'string.guid': 'Each note ID must be a valid UUID',
      }),
    format: Joi.string()
      .valid('markdown', 'html', 'pdf', 'json', 'plain-text')
      .required()
      .messages({
        'any.only': 'Format must be one of: markdown, html, pdf, json, plain-text',
        'any.required': 'Format is required',
      }),
    includeMetadata: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'Include metadata must be true or false',
      }),
  }),

  // Create note from template
  createFromTemplate: Joi.object({
    templateId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Template ID must be a valid UUID',
        'any.required': 'Template ID is required',
      }),
    title: Joi.string()
      .max(300)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Title cannot exceed 300 characters',
      }),
    variables: Joi.object()
      .pattern(Joi.string(), Joi.string().max(1000))
      .max(50)
      .optional()
      .messages({
        'object.base': 'Variables must be an object',
        'object.max': 'Cannot have more than 50 variables',
        'string.max': 'Each variable value cannot exceed 1000 characters',
      }),
  }),

  // Search notes with advanced filters
  searchNotes: Joi.object({
    query: Joi.string()
      .min(1)
      .max(500)
      .required()
      .messages({
        'string.min': 'Search query cannot be empty',
        'string.max': 'Search query cannot exceed 500 characters',
        'any.required': 'Search query is required',
      }),
    searchIn: Joi.array()
      .items(Joi.string().valid('title', 'content', 'tags', 'category'))
      .min(1)
      .default(['title', 'content'])
      .messages({
        'array.base': 'Search in must be an array',
        'array.min': 'At least one search field is required',
        'any.only': 'Search fields must be one of: title, content, tags, category',
      }),
    matchType: Joi.string()
      .valid('partial', 'exact', 'fuzzy')
      .default('partial')
      .messages({
        'any.only': 'Match type must be one of: partial, exact, fuzzy',
      }),
    page: commonValidations.pagination.extract('page'),
    limit: commonValidations.pagination.extract('limit'),
    categories: Joi.array()
      .items(Joi.string().max(100))
      .max(10)
      .optional()
      .messages({
        'array.base': 'Categories must be an array',
        'array.max': 'Cannot filter by more than 10 categories',
      }),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .optional()
      .messages({
        'array.base': 'Tags must be an array',
        'array.max': 'Cannot filter by more than 20 tags',
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
  }),

  // Import notes from external sources
  importNotes: Joi.object({
    format: Joi.string()
      .valid('markdown', 'html', 'json', 'plain-text', 'evernote', 'notion')
      .required()
      .messages({
        'any.only': 'Format must be one of: markdown, html, json, plain-text, evernote, notion',
        'any.required': 'Format is required',
      }),
    data: Joi.string()
      .min(1)
      .max(50000000) // 50MB import limit
      .required()
      .messages({
        'string.min': 'Data cannot be empty',
        'string.max': 'Data cannot exceed 50MB',
        'any.required': 'Data is required',
      }),
    preserveMetadata: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'Preserve metadata must be true or false',
      }),
    defaultCategory: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Default category cannot exceed 100 characters',
      }),
    overwrite: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Overwrite must be true or false',
      }),
  }),

  // Note version management
  revertToVersion: Joi.object({
    versionId: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Version ID must be a valid UUID',
        'any.required': 'Version ID is required',
      }),
  }),

  // Note collaboration
  addCollaborator: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
      }),
    permission: Joi.string()
      .valid('READ', 'WRITE', 'ADMIN')
      .default('READ')
      .messages({
        'any.only': 'Permission must be READ, WRITE, or ADMIN',
      }),
    message: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Message cannot exceed 500 characters',
      }),
  }),
};