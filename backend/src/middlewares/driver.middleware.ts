// TODO: Change the middleware
/**
 * Driver Authorization Middleware
 * Ensures that only users with driver role can access protected driver routes.
 */

import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/ApiResponse';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { handleError } from '../utils/ApiError';

/**
 * Middleware to verify driver access rights
 * Checks if the user has driver role in their JWT token
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * // In routes file:
 * router.post('/driver/trips', driverMiddleware, driverController.getTrips);
 *
 * @throws {401} If no token is provided or token is invalid
 * @throws {403} If user is not a driver
 */
const driverMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract JWT token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      sendResponse(res, 401, {}, 'No authentication token provided')
      return;
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    // Check if token contains valid driver credentials
    if (!decoded || !decoded.userId || decoded.role !== 'driver') {
      sendResponse(res, 403, {}, 'Driver access required')
      return;
    }

    // Token is valid and user is a driver
    next();
  } catch (error) {
    console.error('❌ Driver Authorization Error:', error);
    handleError(res, error, 'Token is not valid');
  }
};

export default driverMiddleware;
