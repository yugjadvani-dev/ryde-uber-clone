/**
 * Authentication and User Management Utilities
 * This module provides utility functions for handling common authentication
 * and user management operations like validation, error handling, and responses.
 */

import { Response } from 'express';
import pool from '../db/db';
import ApiResponse from './ApiResponse';
import bcrypt from 'bcrypt';

/**
 * Interface for validation result containing success status and optional error message
 */
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates required fields in a request
 * @param fields - Object containing field names and their values
 * @returns ValidationResult indicating if all required fields are present
 * @example
 * const validation = validateRequiredFields({ email: 'user@example.com', password: '' });
 * if (!validation.isValid) {
 *   // Handle missing fields
 * }
 */
export const validateRequiredFields = (fields: Record<string, any>): ValidationResult => {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * Checks if a user exists in the database
 * @param email - User's email address
 * @param expectUserToExist - If true, throws error when user doesn't exist; if false, throws when user does exist
 * @returns Object containing existence status and optional user data
 * @throws Error when user existence doesn't match expectation
 */
export const checkUserExists = async (
  email: string,
  expectUserToExist: boolean = true
): Promise<{ exists: boolean; userData?: any }> => {
  const userExists = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  const exists = userExists.rows.length > 0;

  if (expectUserToExist && !exists) {
    throw new Error('User does not exist');
  }

  if (!expectUserToExist && exists) {
    throw new Error('User already exists');
  }

  return {
    exists,
    userData: exists ? userExists.rows[0] : undefined
  };
};

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
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Sends a standardized API response
 * @param res - Express Response object
 * @param statusCode - HTTP status code
 * @param data - Response data
 * @param message - Response message
 */
export const sendAuthResponse = (
  res: Response,
  statusCode: number,
  data: any,
  message: string
): void => {
  res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

/**
 * Handles authentication and user management errors
 * @param res - Express Response object
 * @param error - Error object or message
 * @param defaultMessage - Default message to use if error doesn't have a message
 */
export const handleAuthError = (
  res: Response,
  error: any,
  defaultMessage: string = 'Something went wrong'
): void => {
  console.error('Auth Error:', error);
  const statusCode = error.statusCode || 500;
  const message = error.message || defaultMessage;
  sendAuthResponse(res, statusCode, {}, message);
};
