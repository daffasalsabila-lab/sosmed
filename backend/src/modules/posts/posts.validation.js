import Joi from 'joi';

export const createPostSchema = Joi.object({
  content: Joi.string().trim().max(2000).allow('', null).label('Status'),
  imageUrl: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(255)
    .allow('', null)
    .label('URL gambar'),
});
