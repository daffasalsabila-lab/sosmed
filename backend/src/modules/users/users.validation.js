import Joi from 'joi';

const imageUrl = Joi.string()
  .trim()
  .uri({ scheme: ['http', 'https'] })
  .max(255)
  .allow('', null)
  .label('URL foto profil');

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().label('Nama'),
  bio: Joi.string().trim().max(500).allow('', null).label('Bio'),
  avatarUrl: imageUrl,
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().label('Password lama'),
  newPassword: Joi.string().min(6).max(72).required().label('Password baru'),
  confirmPassword: Joi.any()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({ 'any.only': 'Konfirmasi password baru tidak cocok', 'any.required': 'Konfirmasi password baru wajib diisi' }),
});
