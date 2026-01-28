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
