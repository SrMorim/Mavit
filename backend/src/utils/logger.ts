/**
 * Winston Logger Configuration
 * Centralized logging with different levels and formats for development and production
 */

import winston from 'winston';
import path from 'path';

const { combine, timestamp, colorize, printf, errors, json } = winston.format;

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Custom format for console output
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Custom format for file output
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled in development)
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      level: 'info',
      format: consoleFormat,
    })
  );
}

// File transport for errors
transports.push(
  new winston.transports.File({
    level: 'error',
    filename: path.join(__dirname, '../../logs/error.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// File transport for all logs
transports.push(
  new winston.transports.File({
    level: process.env.LOG_LEVEL || 'info',
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  transports,
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper functions for common logging patterns
export const logSecurityEvent = (event: string, userId?: string, details?: any) => {
  logger.warn('SECURITY EVENT', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ip: details?.ip || 'unknown',
  });
};

export const logAPIRequest = (method: string, url: string, userId?: string, responseTime?: number) => {
  logger.http('API REQUEST', {
    method,
    url,
    userId,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
    timestamp: new Date().toISOString(),
  });
};

export const logDatabaseOperation = (operation: string, table: string, userId?: string, error?: any) => {
  if (error) {
    logger.error('DATABASE ERROR', {
      operation,
      table,
      userId,
      error: error.message || error,
      timestamp: new Date().toISOString(),
    });
  } else {
    logger.debug('DATABASE OPERATION', {
      operation,
      table,
      userId,
      timestamp: new Date().toISOString(),
    });
  }
};

export { logger };