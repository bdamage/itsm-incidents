import {api} from './client';

export const KnowledgeAPI = {
  listBases: () => api.get('/api/knowledgeBases').then((r) => r),
  listArticles: (params = {}) => {
     const usp = new URLSearchParams(params);
     return api.get(`/api/knowledgeArticles?${usp.toString()}`);
  },
  getArticle: (id) => api.get(`/api/knowledgeArticles/${id}`).then((r) => r),
  // admin
  createArticle: (payload, roleHeader = {}) =>
    api.post('/api/knowledgeArticles', payload, { headers: roleHeader }).then((r) => r),
  updateArticle: (id, payload, roleHeader = {}) =>
    api.put(`/api/knowledgeArticles/${id}`, payload, { headers: roleHeader }).then((r) => r),
  deleteArticle: (id, roleHeader = {}) => api.delete(`/api/knowledgeArticles/${id}`, { headers: roleHeader }).then((r) => r)
};