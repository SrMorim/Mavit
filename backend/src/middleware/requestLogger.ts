/**
 * Request Logging Middleware
 * Logs HTTP requests with security considerations and performance metrics
 */

import { Request, Response, NextFunction } from 'express';
import { logAPIRequest, logger } from '../utils/logger';

// Interface for request logging data
interface RequestLogData {
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userId?: string;
  ip: string;
  userAgent?: string;
  contentLength?: string;
  referer?: string;
}

// Sensitive headers to exclude from logs (security)
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
];

// Sensitive URL patterns to sanitize
const SENSITIVE_URL_PATTERNS = [
  /\/api\/auth\/login/,
  /\/api\/auth\/register/,
  /\/api\/auth\/reset-password/,
  /password/i,
  /token/i,
];

// Sanitize URL for logging (remove sensitive parameters)
const sanitizeUrl = (url: string): string => {
  // Check if URL contains sensitive patterns
  const isSensitive = SENSITIVE_URL_PATTERNS.some(pattern => pattern.test(url));
  
  if (isSensitive) {
    // Just return the path without query parameters for sensitive URLs
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.pathname;
  }
  
  return url;
};

// Sanitize headers for logging
const sanitizeHeaders = (headers: any): any => {
  const sanitized = { ...headers };
  
  SENSITIVE_HEADERS.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Get client IP address (considering proxy headers)
const getClientIP = (req: Request): string => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

// Main request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  
  // Create request log data
  const requestData: RequestLogData = {
    method: req.method,
    url: sanitizeUrl(req.originalUrl || req.url),
    ip: clientIP,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length'),
    referer: req.get('Referer'),
  };

  // Log incoming request in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Incoming request:', {
      ...requestData,
      headers: sanitizeHeaders(req.headers),
      timestamp: new Date().toISOString(),
    });
  }

  // Override res.end to capture response data
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: any, cb?: any): Response {
    const responseTime = Date.now() - startTime;
    
    // Add response data to log
    requestData.statusCode = res.statusCode;
    requestData.responseTime = responseTime;
    requestData.userId = req.user?.id;

    // Log completed request
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel]('Request completed:', {
      ...requestData,
      responseHeaders: process.env.NODE_ENV === 'development' 
        ? sanitizeHeaders(res.getHeaders()) 
        : undefined,
      timestamp: new Date().toISOString(),
    });

    // Use the specialized API request logger
    logAPIRequest(
      requestData.method,
      requestData.url,
      requestData.userId,
      responseTime
    );

    // Performance warning for slow requests
    if (responseTime > 1000) {
      logger.warn('Slow request detected:', {
        ...requestData,
        threshold: '1000ms',
      });
    }

    // Security warning for failed authentication attempts
    if (res.statusCode === 401 && req.originalUrl?.includes('/auth/')) {
      logger.warn('Failed authentication attempt:', {
        ip: clientIP,
        userAgent: req.get('User-Agent'),
        url: sanitizeUrl(req.originalUrl),
        timestamp: new Date().toISOString(),
      });
    }

    // Call original end method and return its result
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

// Middleware for logging security events
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\./,          // Directory traversal
    /<script/i,      // XSS attempt
    /union.*select/i, // SQL injection
    /javascript:/i,   // JavaScript protocol
    /vbscript:/i,     // VBScript protocol
  ];

  const url = req.originalUrl || req.url;
  const body = JSON.stringify(req.body || {});
  
  const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body)
  );

  if (hasSuspiciousContent) {
    logger.warn('Suspicious request detected:', {
      method: req.method,
      url: sanitizeUrl(url),
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Middleware for API rate limiting logs
export const rateLimitLogger = (req: Request, res: Response, next: NextFunction): void => {
  // This would be called by rate limiting middleware to log rate limit events
  res.on('finish', () => {
    if (res.statusCode === 429) {
      logger.warn('Rate limit exceeded:', {
        method: req.method,
        url: sanitizeUrl(req.originalUrl || req.url),
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};