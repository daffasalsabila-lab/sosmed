import { http } from '@/lib/http';

const toFormData = (fields, file, fileField = 'image') => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  if (file) fd.append(fileField, file);
  return fd;
};

export const fetchPosts = (page = 1, limit = 10, userId) =>
  http.get('/posts', { params: { page, limit, ...(userId ? { userId } : {}) } })
    .then((r) => ({ posts: r.data.data, meta: r.data.meta }));

export const createPost = ({ content, imageUrl, file, latitude, longitude, locationName }) =>
  http.post('/posts', toFormData({ content, imageUrl, latitude, longitude, locationName }, file)).then((r) => r.data.data);

export const updatePost = (id, { content, imageUrl, file, latitude, longitude, locationName, removeLocation }) =>
  http.patch(`/posts/${id}`, toFormData({ content, imageUrl, latitude, longitude, locationName, removeLocation }, file))
    .then((r) => r.data.data);

export const deletePost = (id) => http.delete(`/posts/${id}`).then((r) => r.data);

export const toggleLike = (id) => http.post(`/posts/${id}/like`).then((r) => r.data.data);

export const fetchComments = (postId) => http.get(`/posts/${postId}/comments`).then((r) => r.data.data);

export const createComment = (postId, { comment, imageUrl, file, parentId, latitude, longitude, locationName }) =>
  http.post(`/posts/${postId}/comments`, toFormData({ comment, imageUrl, parentId, latitude, longitude, locationName }, file))
    .then((r) => r.data.data);

export const toggleCommentLike = (postId, commentId) =>
  http.post(`/posts/${postId}/comments/${commentId}/like`).then((r) => r.data.data);

export const updateComment = (postId, commentId, { comment, imageUrl, file, removeImage, latitude, longitude, locationName, removeLocation }) =>
  http.put(
    `/posts/${postId}/comments/${commentId}`,
    toFormData({ comment, imageUrl, removeImage, latitude, longitude, locationName, removeLocation }, file),
  ).then((r) => r.data.data);

export const deleteComment = (postId, commentId) =>
  http.delete(`/posts/${postId}/comments/${commentId}`).then((r) => r.data);
