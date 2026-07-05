import api from './api';

export const commentService = {
  addComment: (taskId, data) => api.post(`/comments/${taskId}`, data),
  updateComment: (commentId, data) => api.put(`/comments/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};
