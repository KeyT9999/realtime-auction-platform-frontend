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

    // Lấy lịch sử giao dịch
    getTransactions: async (page = 1, limit = 20) => {
        return await apiService.get(`/payment/transactions?page=${page}&limit=${limit}`);
    }
};

export default paymentService;
