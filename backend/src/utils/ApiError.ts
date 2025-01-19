/**
 * Custom API Error Handling Module
 * Provides a standardized way to create and handle API errors across the application.
 */

/**
 * Interface defining the structure of API errors
 * @interface ApiErrorType
 */
interface ApiErrorType {
  statusCode: number;      // HTTP status code
  data: unknown;          // Additional error data
  message: string;        // Error message
  success: boolean;       // Error status flag
  errors: unknown[];      // Array of additional errors
  stack: string;         // Error stack trace
}

/**
 * Custom error class for handling API errors
 * Extends the built-in Error class and implements ApiErrorType interface
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
class ApiError extends Error implements ApiErrorType {
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
  constructor(
    statusCode: number,
    message = 'Something went wrong',
    errors: unknown[] = [],
    stack = ''
  ) {
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

export default ApiError;
