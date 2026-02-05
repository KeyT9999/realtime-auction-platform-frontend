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
