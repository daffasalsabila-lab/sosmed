import { http } from '@/lib/http';

export const updateProfile = ({ name, bio, avatarUrl, file }) => {
  const fd = new FormData();
  fd.append('name', name);
  fd.append('bio', bio || '');
  if (avatarUrl) fd.append('avatarUrl', avatarUrl);
  if (file) fd.append('avatar', file);
  return http.put('/users/profile', fd).then((r) => r.data.data.user);
};

export const changePassword = (payload) => http.put('/users/password', payload).then((r) => r.data);
