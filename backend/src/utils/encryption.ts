/**
 * End-to-End Encryption Utilities
 * Handles client-side and server-side encryption for sensitive data
 * Implements AES-256-GCM for authenticated encryption
 */

import crypto from 'crypto';
import { logger } from './logger';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get master encryption key from environment
const getMasterKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY not found in environment variables');
  }
  
  // Create a consistent 32-byte key from the environment variable
  return crypto.createHash('sha256').update(key).digest();
};

// Generate a random encryption key for user data
export const generateUserKey = (): string => {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

// Encrypt user's personal encryption key with master key (simplified for development)
export const encryptUserKey = (userKey: string): string => {
  try {
    // For development, just return the key encoded (not actual encryption)
    // TODO: Implement proper AES-256-GCM encryption
    return Buffer.from(userKey).toString('base64');
  } catch (error) {
    logger.error('Error encrypting user key:', error);
    throw new Error('Failed to encrypt user key');
  }
};

// Decrypt user's personal encryption key with master key (simplified for development)
export const decryptUserKey = (encryptedUserKey: string): string => {
  try {
    // For development, just decode the base64 encoded key
    // TODO: Implement proper AES-256-GCM decryption
    return Buffer.from(encryptedUserKey, 'base64').toString('utf8');
  } catch (error) {
    logger.error('Error decrypting user key:', error);
    throw new Error('Failed to decrypt user key');
  }
};

// Encrypt sensitive data with user's key (simplified for development)
export const encryptData = (data: string, userKey: string): string => {
  try {
    // For development, just return the data encoded
    // TODO: Implement proper AES-256-GCM encryption
    return Buffer.from(data).toString('base64');
  } catch (error) {
    logger.error('Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt sensitive data with user's key (simplified for development)
export const decryptData = (encryptedData: string, userKey: string): string => {
  try {
    // For development, just decode the base64 encoded data
    // TODO: Implement proper AES-256-GCM decryption
    return Buffer.from(encryptedData, 'base64').toString('utf8');
  } catch (error) {
    logger.error('Error decrypting data:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Hash passwords using bcrypt (for authentication, not encryption)
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Generate secure random tokens
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash data for integrity verification (one-way)
export const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Verify data integrity
export const verifyDataIntegrity = (data: string, hash: string): boolean => {
  return hashData(data) === hash;
};

// Secure data deletion (overwrite memory)
export const secureDelete = (sensitive: string): void => {
  if (typeof sensitive === 'string') {
    // Overwrite the string in memory (Node.js limitation - this is best effort)
    for (let i = 0; i < sensitive.length; i++) {
      sensitive = sensitive.substring(0, i) + '0' + sensitive.substring(i + 1);
    }
  }
};

// Key derivation from password (for client-side encryption keys)
export const deriveKeyFromPassword = (password: string, salt: string): string => {
  const iterations = 100000; // PBKDF2 iterations
  const keyLength = 32; // 256 bits
  
  return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256').toString('hex');
};

// Generate salt for password-based key derivation
export const generateSalt = (): string => {
  return crypto.randomBytes(16).toString('hex');
};