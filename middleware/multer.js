import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadFolder = path.resolve('uploads');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage });

export const uploadFiles = upload.fields([
    { name: 'personalPicture', maxCount: 1 },
    { name: 'cnicPicture', maxCount: 1 },
    { name: 'image', maxCount: 1 }, 
]);
