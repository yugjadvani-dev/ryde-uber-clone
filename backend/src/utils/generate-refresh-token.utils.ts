/**
 * Refresh Token Generator
 * This module provides functionality to generate JWT refresh tokens for user sessions.
 */

import jwt from 'jsonwebtoken';

/**
 * Generates a JWT refresh token for a user
 * @param userId - The unique identifier of the user
 * @returns JWT refresh token string
 * @throws Error if REFRESH_TOKEN_SECRET is not configured
 */
export const generateRefreshTokenUtils = (userId: number): string => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not configured');
  }

  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
