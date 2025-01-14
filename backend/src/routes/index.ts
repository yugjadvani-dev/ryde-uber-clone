import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = express.Router(); // Initialize the router

router.use('/auth', authRoutes); // Auth routes
router.use('/user', userRoutes); // User routes

export default router;
