/**
 * Authentication Middleware
 * Implements Zero-Trust architecture with JWT validation and session management
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/database';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { logger, logSecurityEvent } from '../utils/logger';

// Extend Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        sessionId: string;
      };
    }
  }
}

// Main authentication middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      logSecurityEvent('MISSING_AUTH_TOKEN', undefined, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      
      res.status(401).json({
        error: 'Access token required',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    // Verify JWT token
    const payload = verifyAccessToken(token);
    
    // Check if session exists and is valid (Zero-Trust verification)
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        token,
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            isVerified: true,
          },
        },
      },
    });

    if (!session) {
      logSecurityEvent('INVALID_SESSION', payload.userId, {
        sessionId: payload.sessionId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      
      res.status(401).json({
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION',
      });
      return;
    }

    // Check if user is active and verified
    if (!session.user.isActive) {
      logSecurityEvent('INACTIVE_USER_ACCESS', payload.userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      
      res.status(401).json({
        error: 'Account is inactive',
        code: 'INACTIVE_ACCOUNT',
      });
      return;
    }

    // Update session's last activity (for session timeout management)
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        // We could update lastActivity here if we had that field
      },
    });

    // Add user information to request object
    req.user = {
      id: session.user.id,
      email: session.user.email,
      sessionId: session.id,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      logSecurityEvent('AUTH_MIDDLEWARE_ERROR', undefined, {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      
      if (error.message === 'Token expired') {
        res.status(401).json({
          error: 'Access token expired',
          code: 'TOKEN_EXPIRED',
        });
        return;
      }
      
      if (error.message === 'Invalid token') {
        res.status(401).json({
          error: 'Invalid access token',
          code: 'INVALID_TOKEN',
        });
        return;
      }
    }

    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Authentication service unavailable',
      code: 'AUTH_SERVICE_ERROR',
    });
  }
};

// Optional authentication middleware (for endpoints that work with or without auth)
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        token,
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            isVerified: true,
          },
        },
      },
    });

    if (session && session.user.isActive) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        sessionId: session.id,
      };
    }
  } catch (error) {
    // Silently fail for optional authentication
    logger.debug('Optional auth failed:', error);
  }

  next();
};

// Rate limiting per user middleware
export const userRateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.id;
    const now = Date.now();
    const userKey = `${userId}:${req.ip}`;
    
    const userRequests = requestCounts.get(userKey);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Reset or create new counter
      requestCounts.set(userKey, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }
    
    if (userRequests.count >= maxRequests) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        requestCount: userRequests.count,
      });
      
      res.status(429).json({
        error: 'Too many requests for this user',
        code: 'USER_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      });
      return;
    }
    
    userRequests.count++;
    next();
  };
};

// Admin role middleware (for future admin features)
export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // First check if user is authenticated
  await authMiddleware(req, res, () => {});
  
  if (!req.user) {
    return; // Auth middleware already sent response
  }
  
  // Check if user has admin role (we'd need to add role field to user model)
  // For now, just placeholder
  const isAdmin = false; // TODO: Implement admin role checking
  
  if (!isAdmin) {
    logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    
    res.status(403).json({
      error: 'Admin access required',
      code: 'INSUFFICIENT_PERMISSIONS',
    });
    return;
  }
  
  next();
};