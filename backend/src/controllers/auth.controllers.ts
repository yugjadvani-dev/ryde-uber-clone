import { Request, Response } from 'express';
import pool from '../db/db';
import bcrypt from 'bcrypt';
import { generateAuthToken } from '../utils/generateAuthToken';
import asyncHandler from '../utils/asyncHandler';
import uploadOnCloudinary from '../utils/cloudinary';
import { generateRefreshToken } from '../utils/generateRefreshToken';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';

const generateAccessAndRefreshTokens = async (userId: number) => {
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    const generatedAccessToken = generateAuthToken(userId, userExists.rows[0].is_admin);
    const generatedRefreshToken = generateRefreshToken(userId);

    return { generatedAccessToken, generatedRefreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating refresh and access token');
  }
};

/**
 * Handles user sign-up by creating a new user in the database.
 *
 * This function expects `firstname`, `lastname`, `email`, `password`, and optionally `is_admin`
 * to be present in the request body. It performs input validation, checks if the user already exists,
 * hashes the password, inserts the new user into the database, generates a JWT token, and returns
 * a success response with the user's details and token.
 *
 * @param req - The HTTP request object, expected to contain user data in its body.
 * @param res - The HTTP response object, used to send back the appropriate response.
 * @returns A Promise that resolves to void.
 */
export const signUp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { firstname, lastname, email, password, is_admin = false } = req.body; // Destructure firstname, lastname, email, password, and is_admin from request body

  // Input Validation
  if (!firstname || !lastname || !email || !password) {
    res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  // Check if user already exists
  const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (userExists.rows.length > 0) {
    res.status(409).json({
      success: false,
      message: 'User already exists',
    });
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
    'INSERT INTO users (firstname, lastname, email, password, avatar, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, firstname, lastname, avatar',
    [firstname, lastname, email, hashedPassword, avatar, is_admin],
  );

  // Send response
  res.status(201).json({
    success: true,
    message: 'User signed up successfully',
    data: newUser.rows[0],
  });
});

/**
 * Handles user sign-in by checking if the user exists, verifying the password, and generating a JWT token.
 *
 * This function expects `email` and `password` to be present in the request body. It performs input validation,
 * checks if the user already exists, verifies the password, and generates a JWT token. If the user is not verified,
 * it returns an error response. If the password is incorrect, it also returns an error response.
 *
 * @param req - The HTTP request object, expected to contain user data in its body.
 * @param res - The HTTP response object, used to send back the appropriate response.
 * @returns A Promise that resolves to void.
 */
export const signIn = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body; // Destructure email and password from request body

    // Input Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!userExists.rows.length) {
      res.status(400).json({
        success: false,
        message: 'User does not exist',
      });
      return;
    }

    // Check if user is verified
    if (!userExists.rows[0].is_verified) {
      res.status(400).json({
        success: false,
        message: 'User is not verified',
      });
      return;
    }

    // Check is password correct
    const isPasswordCorrect = await bcrypt.compare(password, userExists.rows[0].password);

    if (!isPasswordCorrect) {
      res.status(400).json({
        success: false,
        message: 'Incorrect password',
      });
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
      is_admin: userExists.rows[0].is_admin,
    };

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send response
    res.status(200)
      .cookie('accessToken', generatedAccessToken, options)
      .cookie('refreshToken', generatedRefreshToken, options)
      .json({
        success: true,
        message: 'User signed in successfully',
        data: safeUser,
        accessToken: generatedAccessToken,
        refreshToken: generatedRefreshToken,
      });
});

export const signOut = async (req: Request, res: Response): Promise<void> => {
  const userId = req.body?.id; // Assuming req.user is populated via middleware

  if (!userId) {
     res
      .status(400)
      .json(new ApiResponse(400, {}, "User ID not provided"));
    return;
  }

  try {
    // Update user record to remove the refreshToken
    await pool.query(
      "UPDATE users SET refresh_token = NULL WHERE id = $1",
      [userId]
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict" as const, // Use "strict" or "lax" as per your requirement
    };

    res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    console.error("Error logging out user:", error);
    res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};

// TODO: User forgotPassword, User resetPassword, User changePassword, User updateProfile, User deleteProfile, User verifyEmail, User resendVerificationEmail
