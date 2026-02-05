import { apiService } from './api';

class ProductService {
  async getProducts(filters = {}) {
    // For now, get all products. Can add filters later
    return await apiService.get('/products');
  }

  async getProductById(id) {
    return await apiService.get(`/products/${id}`);
  }

  async createProduct(data) {
    return await apiService.post('/products', data);
  }

  async updateProduct(id, data) {
    return await apiService.put(`/products/${id}`, data);
  }

  async deleteProduct(id) {
    return await apiService.delete(`/products/${id}`);
  }
}

export const productService = new ProductService();
import { apiService as api } from './api';

const productService = {
    create: async (formData) => {
        const response = await api.post('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    approve: async (id) => {
        const response = await api.put(`/products/${id}/approve`);
        return response;
    },

    search: async (params) => {
        const response = await api.get('/products/search', { params });
        return response;
    }
};

export default productService;
