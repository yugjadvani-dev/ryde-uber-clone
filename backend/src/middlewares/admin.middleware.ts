import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiResponse from '../utils/ApiResponse';

/**
 * Middleware to verify if the request has a valid admin authentication token.
 *
 * This middleware checks for the presence of a JWT token in the Authorization
 * header of the request. If the token is not present or invalid, it sends a
 * 401 Unauthorized response. It also verifies if the decoded token contains
 * the necessary admin privileges; if not, it sends a 403 Forbidden response.
 * If the token is valid and the user has admin access, the request is passed
 * to the next middleware or route handler.
 *
 * @param req - The incoming HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function in the stack.
 */
const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json(new ApiResponse(401, {}, 'No authentication token provided'));
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    if (!decoded || !decoded.userId || !decoded.is_admin) {
      res.status(403).json(new ApiResponse(401, {}, 'Admin access required'));
      return;
    }

    next();
  } catch {
    res.status(401).json(new ApiResponse(401, {}, 'Token is not valid'));
  }
};

export default adminMiddleware;
