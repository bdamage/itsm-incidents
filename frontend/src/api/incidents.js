import { api } from './client';

export const IncidentAPI = {
  list: (params = {}) => {
    const usp = new URLSearchParams(params);
    return api.get(`/api/incidents?${usp.toString()}`);
  },
  create: (payload) => api.post('/api/incidents', payload),
  read: (id) => api.get(`/api/incidents/${id}`),
  update: (id, payload) => api.patch(`/api/incidents/${id}`, payload),
  updateState: (id, state) => api.patch(`/api/incidents/${id}/state`, { state })
};