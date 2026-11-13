import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import multer from 'multer';
import { uploadDir } from '../config/paths.js';
import { ApiError } from '../utils/ApiError.js';
import { removeUploaded } from '../utils/files.js';

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    // Nama berkas acak; ekstensi diturunkan dari MIME, bukan nama asli (cegah path traversal/double ext).
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${MIME_EXT[file.mimetype]}`),
  }),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) =>
    MIME_EXT[file.mimetype]
      ? cb(null, true)
      : cb(ApiError.unprocessable('Format gambar harus JPG, PNG, WEBP, atau GIF')),
});

// Verifikasi magic bytes agar berkas non-gambar yang menyamar tidak lolos.
async function hasImageSignature(filePath) {
  const fh = await fs.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(12);
    await fh.read(buf, 0, 12, 0);
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const isPng = buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const isGif = buf.subarray(0, 4).toString('ascii') === 'GIF8';
    const isWebp = buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
    return isJpeg || isPng || isGif || isWebp;
  } finally {
    await fh.close();
  }
}

export const uploadImage = (field) => (req, res, next) => {
  upload.single(field)(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 5 MB' : 'Berkas tidak valid';
        return next(ApiError.unprocessable(msg));
      }
      return next(err);
    }
    if (req.file && !(await hasImageSignature(req.file.path))) {
      await removeUploaded(req.file);
      return next(ApiError.unprocessable('Berkas bukan gambar yang valid'));
    }
    next();
  });
};
