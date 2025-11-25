/**
 * Global Error Handler Middleware
 * Centralized error handling with security considerations and proper logging
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

// Custom error types
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error class
export class ValidationError extends AppError {
  public details: any[];

  constructor(message: string, details: any[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// Authentication error class
export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, 401, code);
  }
}

// Authorization error class
export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

// Conflict error class
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

// Handle Prisma database errors
const handlePrismaError = (error: any): AppError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint failed
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        return new ConflictError(`A record with this ${field} already exists`);
      
      case 'P2025':
        // Record not found
        return new NotFoundError('The requested record was not found');
      
      case 'P2003':
        // Foreign key constraint failed
        return new ValidationError('Referenced record does not exist');
      
      case 'P2014':
        // Invalid ID
        return new ValidationError('Invalid ID provided');
      
      default:
        logger.error('Prisma known error:', error);
        return new AppError('Database operation failed', 400, 'DATABASE_ERROR');
    }
  }
  
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    logger.error('Prisma unknown error:', error);
    return new AppError('Database service unavailable', 503, 'DATABASE_UNAVAILABLE');
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error:', error);
    return new ValidationError('Invalid data format');
  }
  
  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error('Prisma initialization error:', error);
    return new AppError('Database connection failed', 503, 'DATABASE_CONNECTION_FAILED');
  }
  
  return new AppError('Database error occurred', 500, 'UNKNOWN_DATABASE_ERROR');
};

// Handle JWT errors
const handleJWTError = (error: Error): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthError('Invalid token', 'INVALID_TOKEN');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AuthError('Token expired', 'TOKEN_EXPIRED');
  }
  
  if (error.name === 'NotBeforeError') {
    return new AuthError('Token not active', 'TOKEN_NOT_ACTIVE');
  }
  
  return new AuthError('Authentication failed', 'AUTH_FAILED');
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: 'error',
    error: {
      message: err.message,
      code: err.code,
      stack: err.stack,
      details: (err as any).details || undefined,
    },
    timestamp: new Date().toISOString(),
  });
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      error: {
        message: err.message,
        code: err.code,
        details: (err as any).details || undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unknown error:', err);
    
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Something went wrong',
        code: 'INTERNAL_SERVER_ERROR',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// Main error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Handle specific error types
  if (err.name?.includes('Prisma') || err.constructor.name?.includes('Prisma')) {
    error = handlePrismaError(err);
  } else if (err.name?.includes('JsonWebToken') || err.name?.includes('Token')) {
    error = handleJWTError(err);
  } else if (err.name === 'ValidationError') {
    error = new ValidationError(err.message);
  } else if (err.name === 'CastError') {
    error = new ValidationError('Invalid data format');
  } else if (err.name === 'MulterError') {
    error = new ValidationError('File upload error');
  } else if (!(err instanceof AppError)) {
    // Convert unknown errors to AppError
    error = new AppError(
      process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }

  // Send appropriate error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};