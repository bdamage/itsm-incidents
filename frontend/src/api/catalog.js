import {api} from './client';

export const CatalogAPI = {
  listCatalogs: (params = {}) => api.get('/api/catalogs', { params }).then((r) => r),
  getCatalog: (id) => api.get(`/api/catalogs/${id}`).then((r) => r),
  listItems: (params = {}) => {
     const usp = new URLSearchParams(params);
    return  api.get(`/api/catalogs/items?${usp.toString()}`);
  }
};


   
