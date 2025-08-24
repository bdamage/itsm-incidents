import client from './client';

export const WorkflowsAPI = {
  list: (params = {}) => client.get('/workflows', { params }).then((r) => r),
  get: (id) => client.get(`/workflows/${id}`).then((r) => r),
  create: (payload, headers = {}) => client.post('/workflows', payload, { headers }).then((r) => r),
  update: (id, payload, headers = {}) => client.put(`/workflows/${id}`, payload, { headers }).then((r) => r),
  remove: (id, headers = {}) => client.delete(`/workflows/${id}`, { headers }).then((r) => r)
};