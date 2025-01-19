/**
 * Authentication Token Generator
 * This module provides functionality to generate JWT access tokens for authenticated users.
 * @requires ACCESS_TOKEN_SECRET - JWT secret key from environment variables
 * @requires ACCESS_TOKEN_EXPIRY - Token expiration time from environment variables
 */

import jwt from 'jsonwebtoken';
import { Role } from '../types/role.type';

/**
 * Generates a JWT access token for a user
 * @param userId - The unique identifier of the user
 * @param role - The role of the user (e.g., 'user', 'admin')
 * @returns JWT access token string
 * @throws Error if ACCESS_TOKEN_SECRET is not configured
 */
export const generateAuthToken = (userId: number, role: Role): string => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not configured');
  }

  return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
