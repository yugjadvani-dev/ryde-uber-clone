/**
 * Driver Controllers Module
 * Handles all authentication-related operations including driver signUp,
 * signIn management.
 */

import { Request, Response } from 'express';
import { handleError } from '../utils/api-error.utils';

/**
 * Register a new driver
 * @route POST /api/driver/sign-up
 * @param {Request} req - Express request object containing driver registration data
 * @param {Response} res - Express response object
 */
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract driver data from request
    const {firstname, lastname, email, password} = req.body;
  } catch (error) {
    handleError(res, error, 'Something went wrong while signing up');
  }
}