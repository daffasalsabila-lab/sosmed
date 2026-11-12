import fs from 'node:fs/promises';
import path from 'node:path';
import { uploadDir } from '../config/paths.js';

export const toPublicPath = (file) => (file ? `/uploads/${file.filename}` : null);

// Berkas yang diunggah diprioritaskan; jika tidak ada, pakai URL (opsional).
export const resolveImage = (file, url) => (file ? toPublicPath(file) : url || null);

// Hapus berkas lokal hanya jika path berada di /uploads (URL eksternal diabaikan).
export async function removeLocalFile(publicPath) {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  try {
    await fs.unlink(path.join(uploadDir, path.basename(publicPath)));
  } catch {
    /* berkas sudah tidak ada */
  }
}

export const removeUploaded = (file) => (file ? fs.unlink(file.path).catch(() => {}) : undefined);
