import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pool from '../db/db';
import ApiResponse from '../utils/ApiResponse';

// Middleware to verify if the request has a valid authentication token
const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/sign-out') {
    return next();
  }

  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json(new ApiResponse(401, {}, 'Unauthorized request'));
      return;
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [decodedToken.userId]);

    if (rows.length === 0) {
      res.status(401).json(new ApiResponse(401, {}, 'Invalid Access Token'));
    }

    next();
  } catch {
    res.status(401).json(new ApiResponse(401, {}, 'Invalid access token'));
  }
};

export default verifyJWT;
