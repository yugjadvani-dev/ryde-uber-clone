import express from 'express';
import { getAllUsers, getUserById, updateUserById } from '../controllers/user.controllers';
import adminMiddleware from '../middlewares/admin.middleware';
import nonAdminMiddleware from '../middlewares/non-admin.middleware';

const router = express.Router();

router.get('/all-users', adminMiddleware, getAllUsers); // Get all the users
router.get('/:id', nonAdminMiddleware, getUserById); // Get single user by id
// TODO: Update user
router.put('/:id', nonAdminMiddleware, updateUserById); // Update user by id

export default router;
