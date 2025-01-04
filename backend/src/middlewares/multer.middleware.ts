import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, "./public/temp");
    },
    filename: function (req, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

export default upload;