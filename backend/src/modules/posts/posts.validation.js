import Joi from 'joi';

export const createPostSchema = Joi.object({
  content: Joi.string().trim().max(500).allow('', null).label('Status'),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  imageUrl: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(255)
    .allow('', null)
    .label('URL gambar'),
}).and('latitude', 'longitude');

// edit dan delete
// Validasi ini memungkinkan pengguna:
// - Mengubah teks postingan.
// - Mengganti gambar.
// - Menghapus gambar dengan mengirim imageUrl kosong.
// - Mempertahankan gambar lama jika tidak mengubah gambar.

export const updatePostSchema = Joi.object({
  content: Joi.string()
    .trim()
    .max(500)
    .allow('', null)
    .label('Status'),

  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  removeLocation: Joi.boolean(),
  imageUrl: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(255)
    .allow('', null)
    .label('URL gambar'),
}).and('latitude', 'longitude');
