import { Request, Response } from 'express';
import pool from '../db/db';
import ApiResponse from '../utils/ApiResponse';
import { v2 as cloudinary } from 'cloudinary';
import uploadOnCloudinary, { cloudinaryFolderName } from '../utils/cloudinary';

// Get all the users
export const getAllUsers = async (_: Request, res: Response): Promise<void> => {
  try {
    const users = await pool.query(
      `SELECT id, avatar, firstname, lastname, email, phone_number, is_verified, created_at FROM users WHERE is_verified = true AND role = 'user'`,
    ); // Query to get all users
    res.status(200).json(new ApiResponse(200, users.rows, 'Users fetched successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, {}, 'Something went wrong while getting all users'));
  }
};

// Get single user by id
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Get the user ID from the request parameters
    const user = await pool.query(
      'SELECT id, avatar, firstname, lastname, email, phone_number, is_verified, created_at FROM users WHERE id = $1',
      [id],
    ); // Query to get the user by ID

    res.status(200).json(new ApiResponse(200, user.rows[0], 'User fetched successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, {}, 'Something went wrong while getting the user details'));
  }
};

// Update profile by id
export const updateProfileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Get the user ID from the request parameters
    const { firstname, lastname, phone_number } = req.body; // Destructure firstname, lastname, and phone_number from request body

    // Get the existing profile
    const existProfile = await pool.query(
      'SELECT id, avatar, firstname, lastname, email, phone_number, is_verified, created_at FROM users WHERE id = $1',
      [id],
    );

    if (existProfile.rowCount === 0) {
      res.status(404).json(new ApiResponse(404, {}, 'Profile Not found'));
      return;
    }

    const existingAvatarUrl = existProfile.rows[0].avatar;
    let existAvatar = null;

    if (existingAvatarUrl) {
      const avatarParts = existingAvatarUrl.split('ryde-uber-clone/');
      if (avatarParts.length > 1) {
        existAvatar = avatarParts[1].split('.')[0];
      }
    }

    // Upload avatar
    const avatarLocalPath = req.file?.path;
    let avatar = existingAvatarUrl;

    if (avatarLocalPath) {
      if (existAvatar) {
        await cloudinary.uploader
          .destroy(`${cloudinaryFolderName}/${existAvatar}`, { invalidate: true })
          .then((result) => console.log(result)); // Delete image from cloudinary
      }
      avatar = await uploadOnCloudinary(avatarLocalPath);
    }

    // Update profile
    const profile = await pool.query(
      'UPDATE users SET firstname = $1, lastname = $2, phone_number = $3, avatar = $4 WHERE id = $5 RETURNING id, avatar, firstname, lastname, email, phone_number, is_verified, created_at',
      [firstname, lastname, phone_number, avatar, id],
    );

    res.status(200).json(new ApiResponse(200, profile.rows[0], 'Profile updated successfully'));
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json(new ApiResponse(500, {}, 'Something went wrong while updating the user details'));
  }
};

// Delete profile by id
export const deleteProfileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Get the user ID from the request parameters

    // Get the existing profile
    const existProfile = await pool.query(
      'SELECT id, avatar, firstname, lastname, email, phone_number, is_verified, created_at FROM users WHERE id = $1',
      [id],
    );

    if (existProfile.rowCount === 0) {
      res.status(404).json(new ApiResponse(404, {}, 'Profile Not found'));
      return;
    }

    const existingAvatarUrl = existProfile.rows[0].avatar;
    let existAvatar = null;

    if (existingAvatarUrl) {
      const avatarParts = existingAvatarUrl.split('ryde-uber-clone/');
      if (avatarParts.length > 1) {
        existAvatar = avatarParts[1].split('.')[0];
      }
    }

    try {
      if (existAvatar) {
        await cloudinary.uploader
          .destroy(`${cloudinaryFolderName}/${existAvatar}`, { invalidate: true })
          .then((result) => console.log(result)); // Delete image from cloudinary
      }

      await pool.query('DELETE FROM users WHERE id = $1', [id]); // Delete a row by id
    } catch (error) {
      console.error(error);
    }

    // Send response
    res.status(200).json(new ApiResponse(200, existProfile.rows[0], 'Profile deleted successfully'));
  } catch {
    res.status(500).json(new ApiResponse(500, {}, 'Something went wrong while delete profile'));
  }
};
