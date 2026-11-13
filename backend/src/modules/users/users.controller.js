import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import * as service from './users.service.js';

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await service.getPublicProfile(req.params.userId);
  sendSuccess(res, { user: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await service.updateProfile(req.user, req.body, req.file);
  sendSuccess(res, { user }, 'Profil berhasil diperbarui');
});

export const changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.user, req.body);
  sendSuccess(res, null, 'Password berhasil diubah');
});
