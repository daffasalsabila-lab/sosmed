import { ApiError } from '../utils/ApiError.js';
import { removeUploaded } from '../utils/files.js';

const messages = {
  'any.required': '{{#label}} wajib diisi',
  'string.base': '{{#label}} harus berupa teks',
  'string.empty': '{{#label}} wajib diisi',
  'string.min': '{{#label}} minimal {{#limit}} karakter',
  'string.max': '{{#label}} maksimal {{#limit}} karakter',
  'string.email': '{{#label}} harus berformat email yang valid',
  'string.uri': '{{#label}} harus berupa URL http/https yang valid',
  'any.only': '{{#label}} tidak sesuai',
};

// Validasi req.body dengan Joi. Jika gagal, berkas yang terlanjur diunggah ikut dihapus.
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body || {}, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
    messages,
  });

  if (error) {
    removeUploaded(req.file);
    const errors = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
    return next(ApiError.unprocessable('Validasi gagal', errors));
  }

  req.body = value;
  next();
};

export const parseIdParam = (name) => (req, res, next) => {
  const id = Number(req.params[name]);
  if (!Number.isInteger(id) || id < 1) return next(ApiError.badRequest(`Parameter ${name} tidak valid`));
  req.params[name] = id;
  next();
};
