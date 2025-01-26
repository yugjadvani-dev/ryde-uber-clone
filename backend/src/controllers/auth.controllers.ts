/**
 * Authentication Controllers Module
 * Handles all authentication-related operations including user and admin signUp,
 * signIn, signOut, verifyEmail, forgotPassword, verifyOTP, resetPassword, changePassword and refreshAccessToken management.
 */

import { Request, Response } from 'express';
import pool from '../db/db';
import asyncHandlerUtils from '../utils/async-handler.utils';
import uploadOnCloudinary from '../utils/cloudinary.utils';
import ApiError, { handleError } from '../utils/api-error.utils';
import ApiResponseUtils, { sendResponse } from '../utils/api-response.utils';
import jwt from 'jsonwebtoken';
import { sendUserWelcomeEmail } from '../emails/send-user-welcome.email';
import {
  hashPassword,
  verifyPassword,
} from '../utils/auth.utils';
import { validateRequiredFieldsUtils } from '../utils/validate-required-fields.utils';
import { checkUserExistsUtils } from '../utils/check-user-exists.utils';
import { addMinutesToDate, otpGenerator } from '../utils/otp-generator.utils';
import { sendForgotOtpEmail } from '../emails/send-forgot-otp.email';
import { sendEmailVerificationEmail } from '../emails/send-email-verification.email';
import { generateAccessAndRefreshTokens } from '../utils/generate-access-and-refresh-tokens.utils';

// Otp generator options
const options = {
  digits: true,
  lowerCaseAlphabets: true,
  upperCaseAlphabets: false,
  specialChars: true,
};

/**
 * Register a new user
 * @route POST /api/auth/sign-up
 * @param {Request} req - Express request object containing user registration data
 * @param {Response} res - Express response object
 */
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user data from request
    const { firstname, lastname, email, password, role } = req.body;

    // Validate required fields
    const validation = validateRequiredFieldsUtils({ firstname, lastname, email, password, role });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'All fields are required');
      return;
    }

    // Check if user already exists
    await checkUserExistsUtils(email, false);

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
 */
export const signIn = asyncHandlerUtils(async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract and validate credentials
    const { email, password } = req.body;
    const validation = validateRequiredFieldsUtils({ email, password });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'All fields are required');
      return;
    }

    // Verify user exists and is verified
    const { userData } = await checkUserExistsUtils(email);
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
    const { generatedAccessToken, generatedRefreshToken } = await generateAccessAndRefreshTokens(userData.id, userData.role);

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
      .json(new ApiResponseUtils(200, user, 'User signed in successfully'));
  } catch (error) {
    handleError(res, error, 'Something went wrong while signing in');
  }
});

/**
 * Sign out user and clear authentication tokens
 * @route POST /api/auth/sign-out
 * @param {Request} req - Express request object containing user ID
 * @param {Response} res - Express response object
 */
export const signOut = async (req: Request, res: Response): Promise<void> => {
  const profileId = req.body?.id;

  if (!profileId) {
    sendResponse(res, 400, {}, 'User ID not provided');
    return;
  }

  try {
    // Clear refresh token in database
    await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [profileId]);

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
      .json(new ApiResponseUtils(200, {}, 'User logged out successfully'));
  } catch (error) {
    handleError(res, error, 'Internal server error');
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @param {Request} req - Express request object containing refresh token
 * @param {Response} res - Express response object
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

    const { generatedAccessToken, generatedRefreshToken } = await generateAccessAndRefreshTokens(user.rows[0].id, user.rows[0].role);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie('accessToken', generatedAccessToken, options)
      .cookie('refreshToken', generatedRefreshToken, options)
      .json(
        new ApiResponseUtils(
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
 * Verify profile's email address
 * @route POST /api/auth/verify-email
 * @param {Request} req - Express request object containing user email
 * @param {Response} res - Express response object
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract email from request
    const {email} = req.body;

    // Validate required fields
    const validation = validateRequiredFieldsUtils({ email });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'All field are required');
      return;
    }

    // Verify user exists
    const { userData } = await checkUserExistsUtils(email);
    if (userData.is_verified) {
      sendResponse(res, 400, {}, 'User is already verified');
      return;
    }

    // Generate OTP
    const otp = otpGenerator(6, options);

    // OTP Expiry
    const otpExpiry = addMinutesToDate(new Date(), 10)

    // Save OTP in the otp_codes table
    await pool.query(
      'INSERT INTO otp_codes (user_id, otp, otp_expiry) VALUES ($1, $2, $3)',
      [userData.id, otp, otpExpiry],
    )

    // Send Forgot password email
    await sendEmailVerificationEmail({
      name: `${userData.firstname} ${userData.lastname}`,
      email: userData.email,
    }, otp)

    sendResponse(res, 200, {}, 'OTP sent successfully for verify email');
  } catch (error) {
    handleError(res, error, 'Something went wrong while verifying email');
  }
}

/**
 * Initiate password reset process
 * @route POST /api/auth/forgot-password
 * @param {Request} req - Express request object containing user email
 * @param {Response} res - Express response object
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate required fields
    const validation = validateRequiredFieldsUtils({ email });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'Email field are required');
      return;
    }

    // Verify user exists and is verified
    const { userData } = await checkUserExistsUtils(email);
    if (!userData.is_verified) {
      sendResponse(res, 400, {}, 'User is not verified');
      return;
    }

    // Generate OTP
    const otp = otpGenerator(6, options);

    // OTP Expiry
    const otpExpiry = addMinutesToDate(new Date(), 10)

    // Save OTP in the otp_codes table
    await pool.query(
      'INSERT INTO otp_codes (user_id, otp, otp_expiry) VALUES ($1, $2, $3)',
      [userData.id, otp, otpExpiry],
    )

    // Send Forgot password email
    await sendForgotOtpEmail({
      name: `${userData.firstname} ${userData.lastname}`,
      email: userData.email,
    }, otp)

    sendResponse(res, 200, {}, 'OTP sent successfully');
  } catch (error) {
    handleError(res, error, 'Error processing password reset request');
  }
};

/**
 * Verify OTP
 * @route POST /api/auth/verify-otp
 * @param {Request} req - Express request object containing user email and otp
 * @param {Response} res - Express response object
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract email and otp from request
    const {email, otp} = req.body;

    // Validate required fields
    const validation = validateRequiredFieldsUtils({ email, otp });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'All field are required');
      return;
    }

    // Verify user exists
    const { userData } = await checkUserExistsUtils(email);

    // Retrieve the latest OTP for the user
    const otpResult = await pool.query(
      'SELECT * FROM otp_codes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userData.id],
    )

    if(otpResult.rows.length === 0){
      sendResponse(res, 400, {}, "No OTP found.");
      return;
    }

    const otpData = otpResult.rows[0];

    if(otpData.otp !== otp || new Date() > new Date(otpData.otp_expiry)) {
      sendResponse(res, 400, {}, "Invalid or expired OTP.");
    }

    // OTP is valid; delete the used OTP
    await pool.query('DELETE FROM otp_codes WHERE id = $1', [otpData.id]);

    // Update user verified value
    await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [userData.id]);

    sendResponse(res, 200, {}, 'OTP verified successfully');
  } catch (error) {
    handleError(res, error, 'Something went wrong while verifying email');
  }
}

/**
 * Reset Password Allow users to reset their password
 * @route POST /api/auth/reset-password
 * @param {Request} req - Express request object containing email and newPassword
 * @param {Response} res - Express response object
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract email and newPassword from request
    const {email, newPassword} = req.body;
    const validation = validateRequiredFieldsUtils({ email, newPassword });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'All fields are required');
      return;
    }

    // Verify user exists and is verified
    const { userData } = await checkUserExistsUtils(email);
    if (!userData.is_verified) {
      sendResponse(res, 400, {}, 'User is not verified');
      return;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    await pool.query(
      'UPDATE users set password = $1 WHERE id = $2',
      [hashedPassword, userData.id],
    )

    sendResponse(res, 200, {}, 'Reset password successfully');
  } catch (error) {
    handleError(res, error, 'Something went wrong while reset password');
  }
}

/**
 * Change Password Allow users to change their password while logged in
 * @route POST /api/auth/change-password
 * @param {Request} req - Express request object containing email, currentPassword and newPassword
 * @param {Response} res - Express response object
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract email and newPassword from request
    const {email, currentPassword, newPassword} = req.body;
    const validation = validateRequiredFieldsUtils({ email, currentPassword, newPassword });
    if (!validation.isValid) {
      sendResponse(res, 400, {}, validation.error || 'All fields are required');
      return;
    }

    // Verify user exists
    const { userData } = await checkUserExistsUtils(email);

    // Verify password
    const isPasswordCorrect = await verifyPassword(currentPassword, userData.password);
    if (!isPasswordCorrect) {
      sendResponse(res, 401, {}, 'Invalid credentials');
      return;
    }

    // Hash password and update with user
    const hashedPassword = await hashPassword(newPassword);

    await pool.query(
      'UPDATE users set password = $1 WHERE id = $2',
      [hashedPassword, userData.id],
    );

    sendResponse(res, 200, {}, 'Change password successfully');
  } catch (error) {
    handleError(res, error, 'Something went wrong while change password');
  }
}

/**
 * TODO: Implement these additional authentication features
 * Each feature should follow the same pattern of comprehensive documentation
 * and error handling as the existing endpoints.
 *
 * @todo Implement changeUserEmail - Allow users to update their email address
 */