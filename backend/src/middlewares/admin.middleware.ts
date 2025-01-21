/**
 * Admin Authorization Middleware
 * Ensures that only users with admin role can access protected admin routes.
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendResponse } from '../utils/ApiResponse';
import { handleError } from '../utils/ApiError';

/**
 * Middleware to verify admin access rights
 * Checks if the user has admin role in their JWT token
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * // In routes file:
 * router.post('/admin/users', adminMiddleware, adminController.getUsers);
 *
 * @throws {401} If no token is provided or token is invalid
 * @throws {403} If user is not an admin
 */
const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract JWT token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      sendResponse(res, 401, {}, 'No authentication token provided')
      return;
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    // Check if token contains valid admin credentials
    if (!decoded || !decoded.userId || decoded.role !== 'admin') {
      sendResponse(res, 403, {}, 'Admin access required')
      return;
    }

    // Token is valid and user is admin
    next();
  } catch (error) {
    console.error('❌ Admin Authorization Error:', error);
    handleError(res, error, 'Token is not valid');
  }
};

export default adminMiddleware;
