import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const nonAdminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
    if (!decoded || decoded.is_admin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. This route is not accessible to administrators',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
    });
  }
};

export default nonAdminMiddleware;
