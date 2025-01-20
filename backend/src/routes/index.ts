/**
 * Main Router Module
 * Central hub for all application routes.
 * Organizes and mounts different route modules to their respective base paths.
 */

import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

// Initialize the main router
const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes); // Authentication routes (login, register, etc.)
router.use('/user', userRoutes); // User management routes (profile, settings, etc.)

export default router;
