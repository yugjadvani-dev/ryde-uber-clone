import express from 'express';
import { refreshAccessToken, signIn, signOut, signUp } from '../controllers/auth.controllers';
import upload from '../middlewares/multer.middleware';
import verifyJWT from '../middlewares/verifyJWT';

const router = express.Router(); // Initialize the router

// Public routes
router.post('/sign-up', upload.single('avatar'), signUp); // User signUp
router.post('/sign-in', signIn); // User signIn

// Secured routes
router.post('/sign-out', verifyJWT, signOut); // User signOut
router.post('/refresh-token', refreshAccessToken);

export default router;
