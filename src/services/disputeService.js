// Mục đích tệp: Chua logic nghiep vu chinh cho phan disputeService.
import { apiService } from './api';

export const disputeService = {
  // Tạo tranh chấp mới
  createDispute: async (data) => {
    return apiService.post('/disputes', data);
  },

  // Lấy tranh chấp của tôi
  getMyDisputes: async () => {
    return apiService.get('/disputes/my');
  },

  // Lấy chi tiết tranh chấp
  getDisputeById: async (id) => {
    return apiService.get(`/disputes/${id}`);
  },

  // Gửi tin nhắn trong tranh chấp
  sendMessage: async (disputeId, data) => {
    return apiService.post(`/disputes/${disputeId}/messages`, data);
  },

  // Admin: Lấy tất cả tranh chấp
  getAllDisputes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status !== undefined && params.status !== '') query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('pageSize', params.pageSize);
    const queryStr = query.toString();
    return apiService.get(`/disputes${queryStr ? `?${queryStr}` : ''}`);
  },

  // Admin: Tiếp nhận xem xét
  reviewDispute: async (id) => {
    return apiService.post(`/disputes/${id}/review`);
  },

  // Admin: Phán quyết
  resolveDispute: async (id, data) => {
    return apiService.post(`/disputes/${id}/resolve`, data);
  },

  // Đóng tranh chấp
  closeDispute: async (id) => {
    return apiService.post(`/disputes/${id}/close`);
  },
};
