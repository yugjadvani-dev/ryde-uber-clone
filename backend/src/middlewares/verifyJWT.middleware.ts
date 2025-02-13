/**
 * JWT Authentication Middleware
 * Verifies JWT tokens in requests and ensures user authentication.
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pool from '../db/db';
import { sendResponse } from '../utils/api-response.utils';
import { handleError } from '../utils/api-error.utils';

/**
 * Middleware to verify JWT authentication tokens
 * Checks for tokens in cookies or Authorization header
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * // In routes file:
 * router.get('/protected-route', verifyJWTMiddleware, protectedController);
 *
 * @throws {401} If token is missing, invalid, or user not found
 */
const verifyJWTMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Skip verification for sign-out endpoint
  if (req.path === '/sign-out') {
    return next();
  }

  try {
    // Check for token in cookies or Authorization header
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      sendResponse(res, 401, {}, 'Unauthorized request')
      return;
    }

    // Verify token and decode payload
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    // Verify user exists in database
    const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1 LIMIT 1', [decodedToken.userId]);

    if (rows.length === 0) {
      sendResponse(res, 401, {}, 'Invalid Access Token')
      return;
    }

    next();
  } catch (error) {
    console.error('❌ JWT Verification Error:', error);
    handleError(res, error, 'Invalid access token');
  }
};

export default verifyJWTMiddleware;
