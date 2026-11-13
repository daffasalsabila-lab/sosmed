import Joi from 'joi';

export const createCommentSchema = Joi.object({
  comment: Joi.string().trim().max(1000).allow('', null).label('Komentar'),
  parentId: Joi.number().integer().positive(),
  imageUrl: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(255)
    .allow('', null)
    .label('URL gambar'),
});

// edit dan delete
export const updateCommentSchema = Joi.object({
  comment: Joi.string().trim().max(1000).allow('', null),
  imageUrl: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(255)
    .allow('', null),
}).min(1);