interface ApiErrorType {
  statusCode: number;
  data: unknown;
  message: string;
  success: boolean;
  errors: unknown[];
  stack: string;
}

class ApiError extends Error implements ApiErrorType {
  public statusCode: number;
  public data: unknown;
  public message: string;
  public success: boolean;
  public errors: unknown[];
  public stack: string;

  constructor(statusCode: number, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack ?? '';
    } else {
      this.stack = '';
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
