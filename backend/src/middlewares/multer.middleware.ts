import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, './public/temp');
  },
  filename: function (req, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const upload = multer({ storage });

export default upload;
