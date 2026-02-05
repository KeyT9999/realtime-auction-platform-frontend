import { apiService } from './api';

class AuctionService {
  async getAuctions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.sellerId) params.append('sellerId', filters.sellerId);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/auctions?${queryString}` : '/auctions';
    return await apiService.get(endpoint);
  }

  async getAuctionById(id) {
    return await apiService.get(`/auctions/${id}`);
  }

  async createAuction(data) {
    return await apiService.post('/auctions', data);
  }

  async updateAuction(id, data) {
    return await apiService.put(`/auctions/${id}`, data);
  }

  async deleteAuction(id) {
    return await apiService.delete(`/auctions/${id}`);
  }

  async updateAuctionStatus(id, status) {
    return await apiService.put(`/auctions/${id}/status`, { status });
  }

  async getAuctionStats() {
    return await apiService.get('/auctions/stats');
  }
}

export const auctionService = new AuctionService();
