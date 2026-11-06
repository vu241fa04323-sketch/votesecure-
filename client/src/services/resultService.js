import api from './api';

export const resultService = {
  getElectionResults: async (electionId) => {
    const response = await api.get(`/results/${electionId}`);
    return response.data;
  },

  getPostResults: async (electionId, postId) => {
    const response = await api.get(`/results/${electionId}/${postId}`);
    return response.data;
  },

  getAdminSummary: async () => {
    const response = await api.get('/results/admin/summary');
    return response.data;
  },

  exportCSV: async (electionId) => {
    const response = await api.get(`/results/${electionId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
