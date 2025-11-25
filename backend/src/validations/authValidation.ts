/**
 * Authentication Validation Schemas
 * Input validation rules for authentication endpoints using Joi
 */

import Joi from 'joi';

// Password strength requirements
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    'any.required': 'Password is required',
  });

// Email validation
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .max(255)
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email must not exceed 255 characters',
    'any.required': 'Email is required',
  });

// Name validation
const nameSchema = Joi.string()
  .min(2)
  .max(100)
  .pattern(/^[a-zA-Z\s]+$/)
  .trim()
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
    'string.pattern.base': 'Name can only contain letters and spaces',
    'any.required': 'Name is required',
  });

// Token validation (for JWT tokens)
const tokenSchema = Joi.string()
  .required()
  .messages({
    'any.required': 'Token is required',
    'string.empty': 'Token cannot be empty',
  });

export const authValidation = {
  // Registration validation
  register: Joi.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
  }),

  // Login validation
  login: Joi.object({
    email: emailSchema,
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  // Refresh token validation
  refresh: Joi.object({
    refreshToken: tokenSchema,
  }),

  // Forgot password validation
  forgotPassword: Joi.object({
    email: emailSchema,
  }),

  // Reset password validation
  resetPassword: Joi.object({
    token: tokenSchema,
    password: passwordSchema,
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
  }),

  // Email verification validation
  verifyEmail: Joi.object({
    token: tokenSchema,
  }),

  // Change password validation (for authenticated users)
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required',
      }),
    newPassword: passwordSchema,
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
  }),

  // Update profile validation
  updateProfile: Joi.object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
};