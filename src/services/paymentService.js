// Mục đích tệp: Chua logic nghiep vu chinh cho phan paymentService.
import { apiService } from './api';

export const paymentService = {
    // Tạo link nạp tiền
    createDeposit: async (amount, description = null) => {
        return await apiService.post('/payment/deposit', { amount, description });
    },

    // Kiểm tra trạng thái nạp tiền
    getDepositStatus: async (orderCode) => {
        return await apiService.get(`/payment/deposit/${orderCode}`);
    },

    // Lấy thông tin ví
    getWallet: async () => {
        return await apiService.get('/payment/wallet');
    },

    // Lấy lịch sử giao dịch (type: optional 0-8, dateFrom/dateTo: ISO string)
    getTransactions: async (page = 1, limit = 20, filters = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (filters.type != null && filters.type !== '') params.set('type', filters.type);
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);
        return await apiService.get(`/payment/transactions?${params.toString()}`);
    }
};

export default paymentService;
