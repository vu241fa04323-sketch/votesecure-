import api from './api';

export const votingService = {
  castVote: async (data) => {
    const response = await api.post('/votes/cast', data);
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/votes/status');
    return response.data;
  },

  getAvailable: async () => {
    const response = await api.get('/votes/available');
    return response.data;
  },
};
