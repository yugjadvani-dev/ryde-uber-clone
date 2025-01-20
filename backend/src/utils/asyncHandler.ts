/**
 * Async Request Handler Module
 * Provides a wrapper for async Express route handlers to handle Promise rejections.
 * This eliminates the need for try-catch blocks in each route handler.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async request handler to properly handle Promise rejections
 *
 * @param requestHandler - Async Express route handler function
 * @returns Express middleware function that handles Promise rejections
 *
 * @example
 * // Instead of:
 * app.get('/users', async (req, res) => {
 *   try {
 *     const users = await getUsers();
 *     res.json(users);
 *   } catch (err) {
 *     next(err);
 *   }
 * });
 *
 * // You can write:
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await getUsers();
 *   res.json(users);
 * }));
 */
const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
