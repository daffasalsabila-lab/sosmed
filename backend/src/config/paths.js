import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const uploadDir = fileURLToPath(new URL('../../uploads', import.meta.url));
fs.mkdirSync(uploadDir, { recursive: true });
