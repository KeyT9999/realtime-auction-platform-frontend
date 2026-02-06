import { apiService as api } from './api';

// Service thống nhất cho Category
export const categoryService = {
  getCategories: async () => {
    return await api.get('/categories');
  },

  getCategoryById: async (id) => {
    return await api.get(`/categories/${id}`);
  },

  getCategoryTree: async () => {
    return await api.get('/categories/tree');
  },

  createCategory: async (data) => {
    return await api.post('/categories', data);
  },

  updateCategory: async (id, data) => {
    return await api.put(`/categories/${id}`, data);
  },

  deleteCategory: async (id) => {
    return await api.delete(`/categories/${id}`);
  },
};

export default categoryService;
