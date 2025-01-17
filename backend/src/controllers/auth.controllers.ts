import { Request, Response } from 'express';
import pool from '../db/db';
import bcrypt from 'bcrypt';
import { generateAuthToken } from '../utils/generateAuthToken';
import asyncHandler from '../utils/asyncHandler';
import uploadOnCloudinary from '../utils/cloudinary';
import { generateRefreshToken } from '../utils/generateRefreshToken';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import jwt from 'jsonwebtoken';

// Generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId: number) => {
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    const generatedAccessToken = generateAuthToken(userId, userExists.rows[0].role);
    const generatedRefreshToken = generateRefreshToken(userId);

    return { generatedAccessToken, generatedRefreshToken };
  } catch {
    throw new ApiError(500, 'Something went wrong while generating refresh and access token');
  }
};

// Sign up user controller
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstname, lastname, email, password, role } = req.body; // Destructure firstname, lastname, email, password, and role from request body

    // Input Validation
    if (!firstname || !lastname || !email || !password || !role) {
      res.status(400).json(new ApiResponse(400, {}, 'All fields are required'));
    }

    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      res.status(409).json(new ApiResponse(409, {}, 'User already exists'));
      return;
    }

    // Upload avatar
    const avatarLocalPath = req.file?.path;

    let avatar = null;
    if (avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user info database
    const newUser = await pool.query(
      'INSERT INTO users (firstname, lastname, email, password, avatar, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, firstname, lastname, avatar',
      [firstname, lastname, email, hashedPassword, avatar, role],
    );

    // Send response
    res.status(201).json(new ApiResponse(201, newUser.rows[0], 'User signed up successfully'));
  } catch {
    res.status(500).json(new ApiResponse(500, {}, 'Something went wrong while signing up'));
  }
};

// Sign in user controller
export const signIn = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body; // Destructure email and password from request body

  // Input Validation
  if (!email || !password) {
    res.status(400).json(new ApiResponse(400, {}, 'All fields are required'));
    return;
  }

  // Check if user already exists
  const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (!userExists.rows.length) {
    res.status(400).json(new ApiResponse(400, {}, 'User does not exist'));
    return;
  }

  // Check if user is verified
  if (!userExists.rows[0].is_verified) {
    res.status(400).json(new ApiResponse(400, {}, 'User is not verified'));
    return;
  }

  // Check is password correct
  const isPasswordCorrect = await bcrypt.compare(password, userExists.rows[0].password);

  if (!isPasswordCorrect) {
    res.status(400).json(new ApiResponse(400, {}, 'Incorrect password'));
    return;
  }

  // Generate JWT token
  const { generatedAccessToken, generatedRefreshToken } = await generateAccessAndRefreshTokens(userExists.rows[0].id);

  // Create safe user
  const safeUser = {
    id: userExists.rows[0].id,
    email: userExists.rows[0].email,
    firstname: userExists.rows[0].firstname,
    lastname: userExists.rows[0].lastname,
    role: userExists.rows[0].role,
  };

  const options = {
    httpOnly: true,
    secure: true,
  };

  const user = {
    user: safeUser,
    accessToken: generatedAccessToken,
    refreshToken: generatedRefreshToken,
  };

  // Send response
  res
    .status(200)
    .cookie('accessToken', generatedAccessToken, options)
    .cookie('refreshToken', generatedRefreshToken, options)
    .json(new ApiResponse(200, user, 'User signed in successfully'));
});

// Sign out user controller
export const signOut = async (req: Request, res: Response): Promise<void> => {
  const userId = req.body?.id; // Assuming req.user is populated via middleware

  if (!userId) {
    res.status(400).json(new ApiResponse(400, {}, 'User ID not provided'));
    return;
  }

  try {
    // Update user record to remove the refreshToken
    await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [userId]);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const, // Use "strict" or "lax" as per your requirement
    };

    res
      .status(200)
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions)
      .json(new ApiResponse(200, {}, 'User logged out successfully'));
  } catch {
    res.status(500).json(new ApiResponse(500, {}, 'Internal server error'));
  }
};

// Refresh access token controller
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  const incomingRefreshToken: string = req.cookies.refreshToken || req.body.accessToken;

  try {
    if (!incomingRefreshToken) {
      res.status(401).json(new ApiResponse(401, {}, 'unauthorized request'));
    }

    // Decode and verify the refresh token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;

    const userId = decodedToken?._id;

    if (!userId) {
      res.status(401).json(new ApiResponse(401, {}, 'Invalid refresh token'));
    }

    // Fetch the user from PostgreSQL using a raw query
    const query = 'SELECT id, refresh_token FROM users WHERE id = $1 LIMIT 1';
    const result = await pool.query(query, [userId]);

    if (result.rowCount === 0) {
      res.status(401).json(new ApiResponse(401, {}, 'Invalid refresh token'));
    }

    const user = result.rows[0];

    // Validate the refresh token matches the one stored in the database
    if (incomingRefreshToken !== user.refresh_token) {
      res.status(401).json(new ApiResponse(401, {}, 'Refresh token is expired or used'));
    }

    // Generate new tokens
    const { generatedAccessToken, generatedRefreshToken } = await generateAccessAndRefreshTokens(user.id);

    // Update the user's refresh token in the database
    const updateQuery = 'UPDATE users SET refresh_token = $1 WHERE id = $2';
    await pool.query(updateQuery, [generatedRefreshToken, user.id]);

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    // Send response with new tokens
    res
      .status(200)
      .cookie('accessToken', generatedAccessToken, cookieOptions)
      .cookie('refreshToken', generatedRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken: generatedAccessToken, refreshToken: generatedRefreshToken },
          'Access token refreshed',
        ),
      );
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(401).json(new ApiResponse(401, {}, error?.message || 'Invalid refresh token'));
    }
  }
};

// TODO: Change User Email, User forgotPassword, User resetPassword, User changePassword, User verifyEmail, User resendVerificationEmail
