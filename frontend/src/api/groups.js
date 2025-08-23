import { api } from './client';

export const GroupsAPI = {
  list: (q = '') => api.get(`/api/groups?q=${encodeURIComponent(q)}`),
  create: (payload) => api.post('/api/groups', payload)
};