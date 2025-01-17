import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiResponse from '../utils/ApiResponse';

// Middleware to verify if the request has a valid admin authentication token
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

    if (!decoded || !decoded.userId || decoded.role !== 'admin') {
      res.status(403).json(new ApiResponse(403, {}, 'Admin access required'));
      return;
    }

    next();
  } catch {
    res.status(401).json(new ApiResponse(401, {}, 'Token is not valid'));
  }
};

export default adminMiddleware;
