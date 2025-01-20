/**
 * Admin Authorization Middleware
 * Ensures that only users with admin role can access protected admin routes.
 *
 * @requires ACCESS_TOKEN_SECRET - JWT secret key from environment variables
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiResponse from '../utils/ApiResponse';

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
      res.status(401).json(new ApiResponse(401, {}, 'No authentication token provided'));
      return;
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    // Check if token contains valid admin credentials
    if (!decoded || !decoded.userId || decoded.role !== 'admin') {
      res.status(403).json(new ApiResponse(403, {}, 'Admin access required'));
      return;
    }

    // Token is valid and user is admin
    next();
  } catch (error) {
    console.error('❌ Admin Authorization Error:', error);
    res.status(401).json(new ApiResponse(401, {}, 'Token is not valid'));
  }
};

export default adminMiddleware;
