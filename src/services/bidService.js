import { apiService } from './api';

class BidService {
  async getBidsByAuction(auctionId) {
    return await apiService.get(`/bids/auction/${auctionId}`);
  }

  async getMyBids() {
    return await apiService.get('/bids/my-bids');
  }

  async createBid(data) {
    return await apiService.post('/bids', data);
  }

  async deleteBid(id) {
    return await apiService.delete(`/bids/${id}`);
  }

  async getBidStats() {
    return await apiService.get('/bids/stats');
  }
}

export const bidService = new BidService();
