import { apiService as api } from './api';

// Service thống nhất cho Product
export const productService = {
  // Danh sách sản phẩm (có thể thêm filters sau)
  getProducts: async () => {
    return await api.get('/products');
  },

  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  // Tạo sản phẩm (hỗ trợ FormData để upload ảnh)
  create: async (formData) => {
    return await api.post('/products', formData);
  },

  updateProduct: async (id, data) => {
    return await api.put(`/products/${id}`, data);
  },

  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  },

  approve: async (id) => {
    return await api.put(`/products/${id}/approve`);
  },

  search: async (params) => {
    // Nếu cần query string, có thể build thủ công; tạm thời gọi endpoint cơ bản
    return await api.get('/products/search', { params });
  },
};

export default productService;
