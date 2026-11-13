export const userSelect = { id: true, name: true, avatar: true };

export const toPublicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  bio: u.bio,
  createdAt: u.createdAt,
});
