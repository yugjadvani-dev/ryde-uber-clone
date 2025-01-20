/**
 * Multer Configuration Module
 * Configures file upload handling and storage settings using multer.
 * Files are temporarily stored in the public/temp directory before being processed.
 */

import multer from 'multer';

/**
 * Configure multer disk storage
 * Specifies destination directory and filename generation for uploaded files
 */
const storage = multer.diskStorage({
  /**
   * Set destination directory for uploaded files
   * @param req - Express request object
   * @param file - File object from multer
   * @param cb - Callback to handle destination
   */
  destination: function (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) {
    cb(null, './public/temp');
  },

  /**
   * Generate unique filename for uploaded file
   * Combines timestamp and random number to ensure uniqueness
   * @param req - Express request object
   * @param file - File object from multer
   * @param cb - Callback to handle filename
   */
  filename: function (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

/**
 * Initialize multer with configured storage
 * @example
 * // In routes file:
 * router.post('/upload', upload.single('avatar'), uploadController);
 */
const upload = multer({ storage });

export default upload;
