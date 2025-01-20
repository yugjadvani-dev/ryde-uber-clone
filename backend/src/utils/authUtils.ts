/**
 * Authentication and User Management Utilities
 * This module provides utility functions for handling common authentication
 * and user management operations like validation, error handling, and responses.
 */

import bcrypt from 'bcrypt';

/**
 * Hashes a plain text password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verifies if a plain text password matches a hashed password
 * @param plainPassword - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise resolving to boolean indicating if passwords match
 */
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};