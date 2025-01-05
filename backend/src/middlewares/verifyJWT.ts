import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import pool from '../db/db';

const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/sign-out') {
    return next();
  }

  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized request',
      });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    const { rows } = await pool.query(
      "SELECT id, email FROM users WHERE id = $1",
      [decodedToken.userId]
    );

    if (rows.length === 0) {
      throw new ApiError(401, "Invalid Access Token");
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'error?.message || "Invalid access token"',
    });
  }
})

export default verifyJWT;