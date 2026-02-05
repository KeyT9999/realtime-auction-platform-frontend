import { apiService } from './api';

class CategoryService {
  async getCategories() {
    return await apiService.get('/categories');
  }

  async getCategoryById(id) {
    return await apiService.get(`/categories/${id}`);
  }

  async getCategoryTree() {
    return await apiService.get('/categories/tree');
  }

  async createCategory(data) {
    return await apiService.post('/categories', data);
  }

  async updateCategory(id, data) {
    return await apiService.put(`/categories/${id}`, data);
  }

  async deleteCategory(id) {
    return await apiService.delete(`/categories/${id}`);
  }
}

export const categoryService = new CategoryService();
import { apiService as api } from './api';

const categoryService = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response;
    },

    create: async (data) => {
        const response = await api.post('/categories', data);
        return response;
    },

    update: async (id, data) => {
        const response = await api.put(`/categories/${id}`, data);
        return response;
    },

    delete: async (id) => {
        await api.delete(`/categories/${id}`);
    }
};

export default categoryService;
