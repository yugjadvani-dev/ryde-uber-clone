/**
 * Authentication Controllers Module
 * Handles all authentication-related operations including user registration,
 * login, logout, and token management.
 */

import { Request, Response } from 'express';
import pool from '../db/db';
import { generateAuthToken } from '../utils/generateAuthToken';
import asyncHandler from '../utils/asyncHandler';
import uploadOnCloudinary from '../utils/cloudinary';
import { generateRefreshToken } from '../utils/generateRefreshToken';
import ApiError, { handleError } from '../utils/ApiError';
import ApiResponse, { sendResponse } from '../utils/ApiResponse';
import jwt from 'jsonwebtoken';
import { sendUserWelcomeEmail } from '../emails/send-user-welcome-email';
import {
  hashPassword,
  verifyPassword,
} from '../utils/authUtils';
import { validateRequiredFields } from '../utils/validateRequiredFields';
import { checkUserExists } from '../utils/checkUserExists';

/**
 * Generate new access and refresh tokens for a user
 * @private
 * @param userId - User's ID to generate tokens for
 * @returns {Promise<{generatedAccessToken: string, generatedRefreshToken: string}>} Object containing access and refresh tokens
 * @throws {ApiError} If token generation fails or user not found
 */
const generateAccessAndRefreshTokens = async (userId: number): Promise<{ generatedAccessToken: string; generatedRefreshToken: string; }> => {
  try {
    const userExists = await pool.query('SELECT id, role FROM users WHERE id = $1 LIMIT 1', [userId]);

    const generatedAccessToken = generateAuthToken(userId, userExists.rows[0].role);
    const generatedRefreshToken = generateRefreshToken(userId);

    return { generatedAccessToken, generatedRefreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating refresh and access token');
  }
};

/**
 * Register a new user
 * @route POST /api/auth/sign-up
 * @param {Request} req - Express request object containing user registration data
 * @param {Response} res - Express response object
 * @throws {ApiError} If registration fails
 *
 * @example
 * // Request body
 * {
 *   "firstname": "John",
 *   "lastname": "Doe",
 *   "email": "john@example.com",
 *   "password": "securepassword",
 *   "role": "user"
 * }
 *
 * // Response 201
 * {
 *   "status": 201,
 *   "data": {
 *     "id": 1,
 *     "email": "john@example.com",
 *     "firstname": "John",
 *     "lastname": "Doe",
 *     "avatar": "https://cloudinary.com/avatar.jpg"
 *   },
 *   "message": "User signed up successfully"
 * }
 */
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user data from request
    const { firstname, lastname, email, password, role } = req.body;

    // Validate required fields
    const validation = validateRequiredFields({ firstname, lastname, email, password, role });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'All fields are required');
      return;
    }

    // Check if user already exists
    await checkUserExists(email, false);

    // Handle avatar upload if provided
    const avatarLocalPath = req.file?.path;
    let avatar = null;
    if (avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = await pool.query(
      'INSERT INTO users (firstname, lastname, email, password, avatar, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, firstname, lastname, avatar',
      [firstname, lastname, email, hashedPassword, avatar, role],
    );

    // Send welcome email
    await sendUserWelcomeEmail({
      name: `${firstname} ${lastname}`,
      email: email,
    });

    sendResponse(res, 201, newUser.rows[0], 'User signed up successfully');
  } catch (error) {
    handleError(res, error, 'Something went wrong while signing up');
  }
};

/**
 * Authenticate user and generate tokens
 * @route POST /api/auth/sign-in
 * @param {Request} req - Express request object containing login credentials
 * @param {Response} res - Express response object
 *
 * @example
 * // Request body
 * {
 *   "email": "john@example.com",
 *   "password": "securepassword"
 * }
 *
 * // Response 200
 * {
 *   "status": 200,
 *   "data": {
 *     "user": {
 *       "id": 1,
 *       "email": "john@example.com",
 *       "firstname": "John",
 *       "lastname": "Doe",
 *       "role": "user"
 *     },
 *     "accessToken": "eyJhbGciOiJ...",
 *     "refreshToken": "eyJhbGciOiJ..."
 *   },
 *   "message": "User signed in successfully"
 * }
 */
export const signIn = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract and validate credentials
    const { email, password } = req.body;
    const validation = validateRequiredFields({ email, password });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'All fields are required');
      return;
    }

    // Verify user exists and is verified
    const { userData } = await checkUserExists(email);
    if (!userData.is_verified) {
      sendResponse(res, 400, {}, 'User is not verified');
      return;
    }

    // Verify password
    const isPasswordCorrect = await verifyPassword(password, userData.password);
    if (!isPasswordCorrect) {
      sendResponse(res, 401, {}, 'Invalid credentials');
      return;
    }

    // Generate authentication tokens
    const { generatedAccessToken, generatedRefreshToken } = await generateAccessAndRefreshTokens(userData.id);

    // Create safe user object (excluding sensitive data)
    const safeUser = {
      id: userData.id,
      email: userData.email,
      firstname: userData.firstname,
      lastname: userData.lastname,
      role: userData.role,
    };

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Prepare response data
    const user = {
      user: safeUser,
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken,
    };

    // Send successful response with cookies
    res
      .status(200)
      .cookie('accessToken', generatedAccessToken, options)
      .cookie('refreshToken', generatedRefreshToken, options)
      .json(new ApiResponse(200, user, 'User signed in successfully'));
  } catch (error) {
    handleError(res, error, 'Something went wrong while signing in');
  }
});

/**
 * Sign out user and clear authentication tokens
 * @route POST /api/auth/sign-out
 * @param {Request} req - Express request object containing user ID
 * @param {Response} res - Express response object
 *
 * @example
 * // Request body
 * {
 *   "id": "123"
 * }
 *
 * // Response 200
 * {
 *   "status": 200,
 *   "data": {},
 *   "message": "User logged out successfully"
 * }
 */
export const signOut = async (req: Request, res: Response): Promise<void> => {
  const userId = req.body?.id;

  if (!userId) {
    sendResponse(res, 400, {}, 'User ID not provided');
    return;
  }

  try {
    // Clear refresh token in database
    await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [userId]);

    // Configure cookie options for clearing
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
    };

    // Clear authentication cookies and send response
    res
      .status(200)
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions)
      .json(new ApiResponse(200, {}, 'User logged out successfully'));
  } catch (error) {
    handleError(res, error, 'Internal server error');
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @param {Request} req - Express request object containing refresh token
 * @param {Response} res - Express response object
 *
 * @example
 * // Request cookies should contain refreshToken
 *
 * // Response 200
 * {
 *   "status": 200,
 *   "data": {
 *     "accessToken": "eyJhbGciOiJ...",
 *     "refreshToken": "eyJhbGciOiJ..."
 *   },
 *   "message": "Access token refreshed"
 * }
 */
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [decodedToken.userId]);

    if (!user.rows[0]) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const { generatedAccessToken, generatedRefreshToken } = await generateAccessAndRefreshTokens(user.rows[0].id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie('accessToken', generatedAccessToken, options)
      .cookie('refreshToken', generatedRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken: generatedAccessToken, refreshToken: generatedRefreshToken },
          'Access token refreshed',
        ),
      );
  } catch (error) {
    handleError(res, error, 'Invalid refresh token');
  }
};

/**
 * Initiate password reset process
 * @route POST /api/auth/forgot-password
 * @param {Request} req - Express request object containing user email
 * @param {Response} res - Express response object
 *
 * @example
 * // Request body
 * {
 *   "email": "john@example.com"
 * }
 *
 * // Response 200
 * {
 *   "status": 200,
 *   "data": {},
 *   "message": "Password reset instructions sent to email"
 * }
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendResponse(res, 400, {}, 'Email is required');
      return;
    }

    const { userData } = await checkUserExists(email);

    // TODO: Generate password reset token and send email
    // This is a placeholder for the actual implementation
    res
      .status(200)
      .json(new ApiResponse(200, {}, 'If a user with that email exists, password reset instructions will be sent.'));
  } catch (error) {
    handleError(res, error, 'Error processing password reset request');
  }
};

/**
 * TODO: Implement these additional authentication features
 * Each feature should follow the same pattern of comprehensive documentation
 * and error handling as the existing endpoints.
 *
 * @todo Implement changeUserEmail - Allow users to update their email address
 * @todo Implement resetPassword - Allow users to reset their password using a token
 * @todo Implement changePassword - Allow users to change their password while logged in
 * @todo Implement verifyEmail - Verify user's email address
 * @todo Implement resendVerificationEmail - Resend verification email
 */
