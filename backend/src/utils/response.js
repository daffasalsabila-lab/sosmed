export const sendSuccess = (res, data = null, message = 'Berhasil', status = 200, meta) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};
