import {api} from './client';

export const UserAPI = {
  myTickets: (userId, params = {}) => api.get(`/api/users/${userId}/tickets`, { params }).then((r) => r)
};