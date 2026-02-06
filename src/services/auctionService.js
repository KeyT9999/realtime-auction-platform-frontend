import { apiService } from './api';

// Service thống nhất cho Auction, dùng route REST mới `/auctions`
export const auctionService = {
  getAuctions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.sellerId) params.append('sellerId', filters.sellerId);

    const queryString = params.toString();
    const endpoint = queryString ? `/auctions?${queryString}` : '/auctions';
    return await apiService.get(endpoint);
  },

  getAuctionById: async (id) => {
    return await apiService.get(`/auctions/${id}`);
  },

  createAuction: async (data) => {
    return await apiService.post('/auctions', data);
  },

  updateAuction: async (id, data) => {
    return await apiService.put(`/auctions/${id}`, data);
  },

  deleteAuction: async (id) => {
    return await apiService.delete(`/auctions/${id}`);
  },

  updateAuctionStatus: async (id, status) => {
    return await apiService.put(`/auctions/${id}/status`, { status });
  },

  getAuctionStats: async () => {
    return await apiService.get('/auctions/stats');
  },
};
