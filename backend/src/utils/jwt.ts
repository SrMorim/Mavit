/**
 * JWT Token Utilities
 * Handles creation, verification, and management of JWT tokens
 * Implements refresh token strategy for enhanced security
 */

import jwt from 'jsonwebtoken';
import { logger } from './logger';
import { generateSecureToken } from './encryption';

interface TokenPayload {
  userId: string;
  email: string;
  sessionId: string;
}

interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion: number;
}

// Get JWT secret from environment
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not found in environment variables');
  }
  return secret;
};

// Get JWT expiration times
const getAccessTokenExpiry = (): string => {
  return process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
};

const getRefreshTokenExpiry = (): string => {
  return process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Longer-lived refresh token
};

// Generate access token
export const generateAccessToken = (payload: TokenPayload): string => {
  try {
    const secret = getJWTSecret();
    const expiresIn = getAccessTokenExpiry();
    
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        sessionId: payload.sessionId,
        type: 'access',
      },
      secret,
      {
        expiresIn: expiresIn,
        issuer: 'mavit-api',
        audience: 'mavit-client',
        subject: payload.userId,
      } as jwt.SignOptions
    );
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

// Generate refresh token
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  try {
    const secret = getJWTSecret();
    const expiresIn = getRefreshTokenExpiry();
    
    return jwt.sign(
      {
        userId: payload.userId,
        sessionId: payload.sessionId,
        tokenVersion: payload.tokenVersion,
        type: 'refresh',
      },
      secret,
      {
        expiresIn: expiresIn,
        issuer: 'mavit-api',
        audience: 'mavit-client',
        subject: payload.userId,
      } as jwt.SignOptions
    );
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload & { exp: number } => {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret, {
      issuer: 'mavit-api',
      audience: 'mavit-client',
    }) as jwt.JwtPayload;
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      sessionId: decoded.sessionId,
      exp: decoded.exp as number,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token:', error.message);
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.info('JWT token expired');
      throw new Error('Token expired');
    } else {
      logger.error('Error verifying access token:', error);
      throw new Error('Token verification failed');
    }
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): RefreshTokenPayload & { exp: number } => {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret, {
      issuer: 'mavit-api',
      audience: 'mavit-client',
    }) as jwt.JwtPayload;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
      tokenVersion: decoded.tokenVersion,
      exp: decoded.exp as number,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid refresh token:', error.message);
      throw new Error('Invalid refresh token');
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.info('Refresh token expired');
      throw new Error('Refresh token expired');
    } else {
      logger.error('Error verifying refresh token:', error);
      throw new Error('Refresh token verification failed');
    }
  }
};

// Decode token without verification (for expired tokens)
export const decodeToken = (token: string): jwt.JwtPayload | null => {
  try {
    const decoded = jwt.decode(token);
    return decoded as jwt.JwtPayload;
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Generate token pair (access + refresh)
export const generateTokenPair = (userId: string, email: string, sessionId: string) => {
  const accessToken = generateAccessToken({
    userId,
    email,
    sessionId,
  });
  
  const refreshToken = generateRefreshToken({
    userId,
    sessionId,
    tokenVersion: 1, // Will be managed by database
  });
  
  return {
    accessToken,
    refreshToken,
    expiresIn: getAccessTokenExpiry(),
    tokenType: 'Bearer',
  };
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Generate session ID
export const generateSessionId = (): string => {
  return generateSecureToken(16);
};