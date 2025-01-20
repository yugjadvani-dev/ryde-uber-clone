/**
 * User Management Routes Module
 * Handles all user-related operations including profile management,
 * user listing, and profile updates.
 *
 * Routes:
 * - GET /user/all-users: List all users (admin only)
 * - GET /user/:id: Get user profile by ID
 * - PUT /user/:id: Update user profile
 * - DELETE /user/:id: Delete user account
 */

import express from 'express';
import { deleteProfileById, getAllUsers, getUserById, updateProfileById } from '../controllers/user.controllers';
import adminMiddleware from '../middlewares/admin.middleware';
import nonAdminMiddleware from '../middlewares/non-admin.middleware';
import upload from '../middlewares/multer.middleware';
import verifyJWT from '../middlewares/verifyJWT';

// Initialize user router
const router = express.Router();

/**
 * Admin Routes
 * These routes are only accessible to administrators
 */
router.get(
  '/all-users',
  adminMiddleware, // Verify admin privileges
  getAllUsers, // Retrieve all user records
);

/**
 * Protected User Routes
 * These routes require authentication and proper role
 */
router.get(
  '/:id',
  verifyJWT, // Verify user is authenticated
  getUserById, // Get single user profile
);

router.put(
  '/:id',
  nonAdminMiddleware, // Ensure user is not an admin
  upload.single('avatar'), // Handle avatar file upload
  updateProfileById, // Process profile update
);

router.delete(
  '/:id',
  nonAdminMiddleware, // Ensure user is not an admin
  deleteProfileById, // Process account deletion
);

export default router;
