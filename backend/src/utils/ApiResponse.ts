/**
 * API Response Handler Module
 * Provides a standardized way to format API responses across the application.
 */

/**
 * Class to handle API responses with consistent structure
 * 
 * @example
 * // Success response
 * return new ApiResponse(200, { user: userData }, 'User created successfully');
 * 
 * @example
 * // Error response
 * return new ApiResponse(404, {}, 'User not found');
 */
class ApiResponse {
  statusCode: number;   // HTTP status code
  data: object;        // Response payload
  message: string;     // Response message
  success: boolean;    // Response status flag

  /**
   * Creates an instance of ApiResponse
   * @param statusCode - HTTP status code (e.g., 200, 201, 400, 404)
   * @param data - Response data object
   * @param message - Response message (defaults to 'Success')
   */
  constructor(statusCode: number, data: object, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    // Automatically set success based on status code (4xx and 5xx are failures)
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
