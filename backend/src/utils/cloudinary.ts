import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

(async function() {
    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
})();

const uploadCloudinary = async (file: string) => {
    try {
        if (!file) return null;

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(file, {
            folder: 'ryde-uber-clone',
            resource_type: 'image',
        })

        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary ", result.url);

        fs.unlinkSync(file);

        // TODO: result.url should be returned
        return result;
    } catch (error) {
        fs.unlinkSync(file); // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}