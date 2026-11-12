import Joi from 'joi';

export const createCommentSchema = Joi.object({
  comment: Joi.string().trim().max(1000).allow('', null).label('Komentar'),
  imageUrl: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(255)
    .allow('', null)
    .label('URL gambar'),
});
