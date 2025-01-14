import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Initialize Cloudinary
(async function () {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
})();

// Upload image to Cloudinary and delete local file after upload is successful or fails
const uploadOnCloudinary = async (file: string) => {
  try {
    if (!file) return null;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: 'ryde-uber-clone',
      resource_type: 'image',
    });

    // file has been uploaded successfully
    console.log('file is uploaded on cloudinary ', result);

    // Check if the file exists before attempting to delete it
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    } else {
      console.warn(`File not found: ${file}`);
    }

    return result.url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);

    // Check if the file exists before attempting to delete it
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    } else {
      console.warn(`File not found: ${file}`);
    }

    return null;
  }
};

export default uploadOnCloudinary;
