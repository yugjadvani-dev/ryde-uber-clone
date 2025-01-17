import express from 'express';
import { deleteProfileById, getAllUsers, getUserById, updateProfileById } from '../controllers/user.controllers';
import adminMiddleware from '../middlewares/admin.middleware';
import nonAdminMiddleware from '../middlewares/non-admin.middleware';
import upload from '../middlewares/multer.middleware';
import verifyJWT from '../middlewares/verifyJWT';

const router = express.Router(); // Initialize the router

// Public routes
router.get('/all-users', adminMiddleware, getAllUsers); // Get all the users
router.get('/:id', verifyJWT, getUserById); // Get single user by id
router.put('/:id', nonAdminMiddleware, upload.single('avatar'), updateProfileById); // Update profile by id
router.delete('/:id', nonAdminMiddleware, deleteProfileById); // Delete profile by id

export default router;
