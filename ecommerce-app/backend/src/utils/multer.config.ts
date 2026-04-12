import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Multer configuration for file uploads
const storage = multer.diskStorage({
    // Define the destination folder for uploaded files
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, "../../../ProductImages/"));
    },
    // Define the filename format for uploaded files
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now();
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
});

const fileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true); //accept these file types
    } else {
        callback(new Error("Only JPEG, PNG, GIF, and WEBP image files are allowed.")); //reject other file types with Error
    }
};

export const upload = multer ({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
});
