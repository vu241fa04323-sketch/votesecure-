import api from './api';

export const postService = {
  getAll: async (params) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};
