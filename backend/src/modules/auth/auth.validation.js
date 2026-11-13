import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().label('Nama lengkap'),
  email: Joi.string().trim().lowercase().email().max(150).required().label('Email'),
  password: Joi.string().min(6).max(72).required().label('Password'),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Konfirmasi password')
    .messages({ 'any.only': 'Konfirmasi password tidak cocok', 'any.required': 'Konfirmasi password wajib diisi' }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().label('Email'),
  password: Joi.string().required().label('Password'),
});
