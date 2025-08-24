import {api} from './client';

export const WorkflowsAPI = {
  list: (params = {}) => api.get('/api/workflows', { params }).then((r) => r),
  get: (id) => api.get(`/api/workflows/${id}`).then((r) => r),
  create: (payload, headers = {}) => api.post('/api/workflows', payload, { headers }).then((r) => r),
  update: (id, payload, headers = {}) => api.put(`/api/workflows/${id}`, payload, { headers }).then((r) => r),
  remove: (id, headers = {}) => api.delete(`/api/workflows/${id}`, { headers }).then((r) => r)
};