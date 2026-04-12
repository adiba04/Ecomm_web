import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { ApiError } from '../utils/api-error';

const uploadsDir = path.join(process.cwd(), 'ProductImages', 'products');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || '.jpg';
    const safeExt = extension.toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, filename);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new ApiError(400, 'Only image files are allowed'));
    return;
  }

  cb(null, true);
};

export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
