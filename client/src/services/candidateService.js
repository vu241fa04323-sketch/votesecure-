import api from './api';

export const candidateService = {
  getAll: async (params) => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  create: async (formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.post('/candidates', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  update: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.put(`/candidates/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },

  toggleStatus: async (id, status) => {
    const response = await api.patch(`/candidates/${id}/status`, { status });
    return response.data;
  },
};
