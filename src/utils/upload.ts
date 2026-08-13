import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const AUDIO_EXTS = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.wma'];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

const isAudioFile = (file: any): boolean => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'audio') return true;
  if (file.mimetype && file.mimetype.startsWith('audio/')) return true;
  if (AUDIO_EXTS.includes(ext)) return true;
  return false;
};

const isImageFile = (file: any): boolean => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['cover', 'poster', 'profile_photo', 'image'].includes(file.fieldname)) return true;
  if (file.mimetype && file.mimetype.startsWith('image/')) return true;
  if (IMAGE_EXTS.includes(ext)) return true;
  return false;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = path.join(process.cwd(), 'public/uploads');
    
    if (isAudioFile(file)) {
      dest = path.join(dest, 'audio');
    } else if (isImageFile(file)) {
      dest = path.join(dest, 'images');
    } else {
      // Fallback based on fieldname or default to images
      dest = file.fieldname === 'audio' ? path.join(dest, 'audio') : path.join(dest, 'images');
    }
    
    // Ensure directory exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (isAudioFile(file) ? '.mp3' : '.jpg');
    cb(null, `${uuidv4()}${ext.toLowerCase()}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (isAudioFile(file) || isImageFile(file)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Hanya file audio (MP3/WAV/FLAC/M4A) dan gambar (JPG/PNG/WEBP) yang diperbolehkan.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter
});

