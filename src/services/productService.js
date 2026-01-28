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
