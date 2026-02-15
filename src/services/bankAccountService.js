import { apiService } from './api';

export const bankAccountService = {
    // Lay danh sach tai khoan ngan hang
    getBankAccounts: async () => {
        return await apiService.get('/bank-accounts');
    },

    // Them tai khoan ngan hang
    createBankAccount: async (data) => {
        return await apiService.post('/bank-accounts', data);
    },

    // Cap nhat tai khoan ngan hang
    updateBankAccount: async (id, data) => {
        return await apiService.put(`/bank-accounts/${id}`, data);
    },

    // Xoa tai khoan ngan hang
    deleteBankAccount: async (id) => {
        return await apiService.delete(`/bank-accounts/${id}`);
    },

    // Dat tai khoan mac dinh
    setDefault: async (id) => {
        return await apiService.put(`/bank-accounts/${id}/default`);
    }
};

export default bankAccountService;
