/**
 * Cloudinary Integration Module
 * This module provides functionality for uploading images to Cloudinary and managing uploads.
 * @requires CLOUDINARY_CLOUD_NAME - Cloudinary cloud name from environment variables
 * @requires CLOUDINARY_API_KEY - Cloudinary API key from environment variables
 * @requires CLOUDINARY_API_SECRET - Cloudinary API secret from environment variables
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Initialize Cloudinary configuration immediately
(async function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
})();

/** Base folder name for all uploads in this application */
export const cloudinaryFolderName = 'ryde-uber-clone';

/**
 * Uploads an image to Cloudinary and handles local file cleanup
 * @param file - Local file path of the image to upload
 * @returns Promise resolving to the Cloudinary URL of the uploaded image, or null if upload fails
 * 
 * @example
 * const imageUrl = await uploadOnCloudinary('./uploads/profile.jpg');
 * if (imageUrl) {
 *   // Image uploaded successfully
 *   console.log('Image URL:', imageUrl);
 * }
 */
const uploadOnCloudinary = async (file: string): Promise<string | null> => {
  try {
    if (!file) return null;

    // Upload image to Cloudinary with specific folder and resource type
    const result = await cloudinary.uploader.upload(file, {
      folder: cloudinaryFolderName,
      resource_type: 'image',
    });

    console.log('✅ File uploaded to Cloudinary:', result.url);

    // Clean up local file after successful upload
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log('🗑️ Local file cleaned up:', file);
    } else {
      console.warn('⚠️ Local file not found for cleanup:', file);
    }

    return result.url;
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);

    // Ensure local file cleanup even if upload fails
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log('🗑️ Local file cleaned up after error:', file);
    } else {
      console.warn('⚠️ Local file not found for cleanup:', file);
    }

    return null;
  }
};

export default uploadOnCloudinary;
