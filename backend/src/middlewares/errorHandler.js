import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { removeUploaded } from '../utils/files.js';

export const notFound = (req, res, next) =>
  next(ApiError.notFound(`Rute ${req.method} ${req.originalUrl} tidak ditemukan`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  removeUploaded(req.file);

  let status = err.status || 500;
  let message = err.message;
  const errors = err.errors;

  if (err.code === 'P2002') {
    status = 409;
    message = 'Data sudah ada (duplikat)';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Format JSON tidak valid';
  } else if (!err.status) {
    console.error(err);
    message = env.isProd ? 'Terjadi kesalahan pada server' : err.message;
  }

  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
};
