/**
 * Authentication Routes Module
 * Handles all authentication-related routes including sign up, sign in, sign out,
 * and token refresh operations.
 *
 * Routes:
 * - POST /auth/sign-up: Register new user with avatar upload
 * - POST /auth/sign-in: Authenticate existing user
 * - POST /auth/sign-out: End user session (requires authentication)
 * - POST /auth/refresh-token: Get new access token using refresh token
 */

import express from 'express';
import {
  forgotPassword,
  refreshAccessToken, resetPassword,
  signIn,
  signOut,
  signUp,
  verifyEmail, verifyOTP,
} from '../controllers/auth.controllers';
import upload from '../middlewares/multer.middleware';
import verifyJWT from '../middlewares/verifyJWT';

// Initialize auth router
const router = express.Router();

/**
 * Public Routes
 * These routes do not require authentication
 */
router.post(
  '/sign-up',
  upload.single('avatar'), // Handle avatar file upload
  signUp, // Process user registration
);

router.post(
  '/sign-in',
  signIn, // Authenticate user credentials
);

router.post(
  '/forgot-password',
  forgotPassword, // Forgot user password
)

router.post(
  '/verify-otp',
  verifyOTP, // Verify otp
)

router.post(
  '/verify-email',
  verifyEmail, // Verify Email
)

router.post(
  '/reset-password',
  resetPassword, // Reset password
)

/**
 * Protected Routes
 * These routes require valid JWT authentication
 */
router.post(
  '/sign-out',
  verifyJWT, // Verify user is authenticated
  signOut, // Process user sign out
);

router.post(
  '/refresh-token',
  refreshAccessToken, // Issue new access token
);

export default router;
