import { apiService } from './api';

export const withdrawalService = {
    // Tao yeu cau rut tien
    createWithdrawal: async (amount, bankAccountId) => {
        return await apiService.post('/withdrawal', { amount, bankAccountId });
    },

    // Xac nhan OTP
    verifyOtp: async (withdrawalId, otpCode) => {
        return await apiService.post('/withdrawal/verify-otp', { withdrawalId, otpCode });
    },

    // Gui lai OTP
    resendOtp: async (withdrawalId) => {
        return await apiService.post('/withdrawal/resend-otp', { withdrawalId });
    },

    // Huy yeu cau rut tien
    cancelWithdrawal: async (withdrawalId) => {
        return await apiService.post(`/withdrawal/${withdrawalId}/cancel`);
    },

    // Lay danh sach yeu cau rut tien
    getMyWithdrawals: async () => {
        return await apiService.get('/withdrawal');
    },

    // Lay chi tiet yeu cau rut tien
    getWithdrawalDetail: async (id) => {
        return await apiService.get(`/withdrawal/${id}`);
    }
};

export default withdrawalService;
