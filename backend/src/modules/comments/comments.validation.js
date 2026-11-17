import Joi from 'joi';

export const createCommentSchema = Joi.object({
  comment: Joi.string().trim().max(1000).allow('', null).label('Komentar'),
  parentId: Joi.number().integer().positive(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  locationName: Joi.string().trim().max(500).allow('', null).label('Nama lokasi'),
  imageUrl: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(255)
    .allow('', null)
    .label('URL gambar'),
}).and('latitude', 'longitude').with('locationName', ['latitude', 'longitude']);

// edit dan delete
export const updateCommentSchema = Joi.object({
  comment: Joi.string().trim().max(1000).allow('', null),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  locationName: Joi.string().trim().max(500).allow('', null).label('Nama lokasi'),
  removeLocation: Joi.boolean(),
  imageUrl: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(255)
    .allow('', null),
}).and('latitude', 'longitude').with('locationName', ['latitude', 'longitude']).min(1);