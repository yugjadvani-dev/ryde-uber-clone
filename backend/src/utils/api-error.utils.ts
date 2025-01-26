/**
 * Custom API Error Handling Module
 * Provides a standardized way to create and handle API errors across the application.
 */

import { sendResponse } from './api-response.utils';
import { Response } from 'express';

/**
 * Interface defining the structure of API errors
 * @interface ApiErrorTypeUtils
 */
interface ApiErrorTypeUtils {
  statusCode: number; // HTTP status code
  data: unknown; // Additional error data
  message: string; // Error message
  success: boolean; // Error status flag
  errors: unknown[]; // Array of additional errors
  stack: string; // Error stack trace
}

/**
 * Custom error class for handling API errors
 * Extends the built-in Error class and implements ApiErrorTypeUtils interface
 *
 * @example
 * throw new ApiError(404, 'User not found');
 *
 * @example
 * throw new ApiError(
 *   400,
 *   'Validation failed',
 *   ['Invalid email format', 'Password too short']
 * );
 */
export default class ApiError extends Error implements ApiErrorTypeUtils {
  public statusCode: number;
  public data: unknown;
  public message: string;
  public success: boolean;
  public errors: unknown[];
  public stack: string;

  /**
   * Creates an instance of ApiError
   * @param statusCode - HTTP status code for the error
   * @param message - Error message (defaults to 'Something went wrong')
   * @param errors - Array of additional error details
   * @param stack - Error stack trace (optional)
   */
  constructor(statusCode: number, message = 'Something went wrong', errors: unknown[] = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      this.stack = '';
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Handles errors
 * @param res - Express Response object
 * @param error - Error object or message
 * @param defaultMessage - Default message to use if error doesn't have a message
 */
export const handleError = (res: Response, error: any, defaultMessage: string = 'Something went wrong'): void => {
  console.error('Error:', error);
  const statusCode = error.statusCode || 500;
  const message = error.message || defaultMessage;
  sendResponse(res, statusCode, {}, message);
};