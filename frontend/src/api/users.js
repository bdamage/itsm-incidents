import { api } from './client';

export const UsersAPI = {
  list: (q = '') => api.get(`/api/users?q=${encodeURIComponent(q)}`),
  create: (payload) => api.post('/api/users', payload),
};