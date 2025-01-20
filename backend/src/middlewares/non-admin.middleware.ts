/**
 * Non-Admin/Non-Driver Authorization Middleware
 * Ensures that only regular users (non-admin, non-driver) can access protected user routes.
 * This is useful for routes that should only be accessible to regular passengers.
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiResponse from '../utils/ApiResponse';

/**
 * Middleware to verify regular user access rights
 * Checks if the user is neither an admin nor a driver
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
 * @throws {403} If user is an admin or driver
 */
const nonAdminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract JWT token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json(new ApiResponse(401, {}, 'No authentication token provided'));
      return;
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    // Check if user is an admin or driver
    if (!decoded || decoded.role === 'admin' || decoded.role === 'driver') {
      res.status(403).json(new ApiResponse(403, {}, 'Access denied. This route is only accessible to passengers'));
      return;
    }

    // Token is valid and user is a regular passenger
    next();
  } catch (error) {
    console.error(' User Authorization Error:', error);
    res.status(401).json(new ApiResponse(401, {}, 'Token is not valid'));
  }
};

export default nonAdminMiddleware;
