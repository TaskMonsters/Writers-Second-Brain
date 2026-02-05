import { Router } from 'express';
import multer from 'multer';
import { storagePut } from './storage';
import { randomBytes } from 'crypto';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  },
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    const randomSuffix = randomBytes(8).toString('hex');
    const fileKey = `novel-kit/${Date.now()}-${randomSuffix}.${fileExtension}`;

    const { url } = await storagePut(
      fileKey,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
