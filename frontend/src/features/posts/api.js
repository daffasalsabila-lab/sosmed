import { http } from '@/lib/http';

const toFormData = (fields, file, fileField = 'image') => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => v && fd.append(k, v));
  if (file) fd.append(fileField, file);
  return fd;
};

export const fetchPosts = (page = 1, limit = 10) =>
  http.get('/posts', { params: { page, limit } }).then((r) => ({ posts: r.data.data, meta: r.data.meta }));

export const createPost = ({ content, imageUrl, file }) =>
  http.post('/posts', toFormData({ content, imageUrl }, file)).then((r) => r.data.data);

export const deletePost = (id) => http.delete(`/posts/${id}`).then((r) => r.data);

export const toggleLike = (id) => http.post(`/posts/${id}/like`).then((r) => r.data.data);

export const fetchComments = (postId) => http.get(`/posts/${postId}/comments`).then((r) => r.data.data);

export const createComment = (postId, { comment, imageUrl, file }) =>
  http.post(`/posts/${postId}/comments`, toFormData({ comment, imageUrl }, file)).then((r) => r.data.data);
