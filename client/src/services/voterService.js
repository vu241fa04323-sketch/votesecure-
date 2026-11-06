import api from './api';

export const voterService = {
  getAll: async (params) => {
    const response = await api.get('/voters', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/voters/${id}`);
    return response.data;
  },

  create: async (formData) => {
    // If formData is FormData instance (for image upload)
    const isFormData = formData instanceof FormData;
    const response = await api.post('/voters', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  update: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.put(`/voters/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/voters/${id}`);
    return response.data;
  },

  toggleStatus: async (id, status) => {
    const response = await api.patch(`/voters/${id}/status`, { status });
    return response.data;
  },

  resetPassword: async (id, newPassword) => {
    const response = await api.post(`/voters/${id}/reset-password`, { newPassword });
    return response.data;
  },
};
