import api from './api';

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  toggleArchive: (id) => api.patch(`/tasks/archive/${id}`),
  toggleFavorite: (id) => api.patch(`/tasks/favorite/${id}`),
};
