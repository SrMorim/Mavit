/**
 * Authentication Controller
 * Handles user authentication operations with security best practices
 */

import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { 
  hashPassword, 
  verifyPassword, 
  generateUserKey, 
  encryptUserKey 
} from '../utils/encryption';
import { 
  generateTokenPair, 
  verifyRefreshToken, 
  generateSessionId,
  extractTokenFromHeader 
} from '../utils/jwt';
import { logger, logSecurityEvent } from '../utils/logger';
import { 
  AppError, 
  AuthError, 
  ConflictError, 
  NotFoundError,
  ValidationError,
  catchAsync 
} from '../middleware/errorHandler';

class AuthController {
  // Register new user
  register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate user encryption key
    const userKey = generateUserKey();
    const encryptedUserKey = encryptUserKey(userKey);

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          encryptionKey: encryptedUserKey,
          isActive: true,
          isVerified: false, // Email verification required
        },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Generate session
      const sessionId = generateSessionId();
      const tokens = generateTokenPair(user.id, user.email, sessionId);

      // Create session record
      await tx.userSession.create({
        data: {
          id: sessionId,
          userId: user.id,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return { user, tokens };
    });

    // Log registration event
    logger.info('User registered successfully:', {
      userId: result.user.id,
      email: result.user.email,
      ip: req.ip,
    });

    // TODO: Send email verification
    // await emailService.sendVerificationEmail(result.user.email, verificationToken);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          isVerified: result.user.isVerified,
          createdAt: result.user.createdAt,
        },
        tokens: result.tokens,
      },
    });
  });

  // Login user
  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
      },
    });

    if (!user) {
      logSecurityEvent('LOGIN_ATTEMPT_INVALID_EMAIL', undefined, {
        email,
        ip: ipAddress,
        userAgent,
      });
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', user.id, {
        ip: ipAddress,
        userAgent,
      });
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.isActive) {
      logSecurityEvent('LOGIN_ATTEMPT_INACTIVE_USER', user.id, {
        ip: ipAddress,
        userAgent,
      });
      throw new AuthError('Account is inactive', 'ACCOUNT_INACTIVE');
    }

    // Generate session and tokens
    const sessionId = generateSessionId();
    const tokens = generateTokenPair(user.id, user.email, sessionId);

    // Create session record and update last login
    await prisma.$transaction(async (tx) => {
      await tx.userSession.create({
        data: {
          id: sessionId,
          userId: user.id,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
        },
      });
    });

    // Log successful login
    logger.info('User logged in successfully:', {
      userId: user.id,
      email: user.email,
      ip: ipAddress,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          lastLogin: new Date(),
        },
        tokens,
      },
    });
  });

  // Logout user
  logout = catchAsync(async (req: Request, res: Response) => {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      // Invalidate session
      await prisma.userSession.updateMany({
        where: {
          token,
          isValid: true,
        },
        data: {
          isValid: false,
        },
      });

      logger.info('User logged out:', {
        userId: req.user?.id,
        ip: req.ip,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  });

  // Refresh access token
  refresh = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Find and validate session
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        refreshToken,
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
          },
        },
      },
    });

    if (!session || !session.user.isActive) {
      logSecurityEvent('INVALID_REFRESH_TOKEN', payload.userId, {
        sessionId: payload.sessionId,
        ip: req.ip,
      });
      throw new AuthError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Generate new access token
    const newTokens = generateTokenPair(
      session.user.id,
      session.user.email,
      session.id
    );

    // Update session with new tokens
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        token: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        tokens: newTokens,
      },
    });
  });

  // Forgot password
  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Always return success to prevent email enumeration
    // but only send email if user exists
    if (user) {
      // TODO: Generate reset token and send email
      // const resetToken = generateSecureToken();
      // await emailService.sendPasswordResetEmail(user.email, resetToken);

      logger.info('Password reset requested:', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });
    } else {
      logSecurityEvent('PASSWORD_RESET_INVALID_EMAIL', undefined, {
        email,
        ip: req.ip,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'If the email exists, a reset link will be sent',
    });
  });

  // Reset password
  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    // TODO: Implement password reset with token validation
    // This is a placeholder implementation
    
    throw new AppError('Password reset not implemented yet', 501, 'NOT_IMPLEMENTED');
  });

  // Verify email
  verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.body;

    // TODO: Implement email verification
    // This is a placeholder implementation

    throw new AppError('Email verification not implemented yet', 501, 'NOT_IMPLEMENTED');
  });
}

export const authController = new AuthController();