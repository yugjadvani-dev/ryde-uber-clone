/**
 * Non-Admin Authorization Middleware
 * Ensures that only regular users (non-admin) can access protected user routes.
 * This is useful for routes that should only be accessible to regular passengers.
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendResponse } from '../utils/ApiResponse';
import { handleError } from '../utils/ApiError';

/**
 * Middleware to verify regular user access rights
 * Checks if the user is neither an admin
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * // In routes file:
 * router.post('/passenger/book', nonAdminMiddleware, passengerController.bookRide);
 *
 * @throws {401} If no token is provided or token is invalid
 * @throws {403} If user is an admin
 */
const nonAdminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract JWT token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      sendResponse(res, 401, {}, 'No authentication token provided')
      return;
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    // Check if user is an admin
    if (!decoded || decoded.role === 'admin') {
      sendResponse(res, 403, {}, 'Access denied. This route is only accessible to passengers')
      return;
    }

    // Token is valid and user is a regular passenger
    next();
  } catch (error) {
    console.error(' User Authorization Error:', error);
    handleError(res, error, 'Token is not valid');
  }
};

export default nonAdminMiddleware;
