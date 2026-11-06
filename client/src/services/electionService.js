import api from './api';

export const electionService = {
  getAll: async (params) => {
    const response = await api.get('/elections', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/elections/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/elections', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/elections/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/elections/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/elections/${id}/status`, { status });
    return response.data;
  },
};
