// Mục đích tệp: Chua logic nghiep vu chinh cho phan bidService.
import { apiService } from './api';

class BidService {
  async getBidsByAuction(auctionId, page = 1, limit = 20) {
    const res = await apiService.get(`/bids/auction/${auctionId}?page=${page}&limit=${limit}`);
    return res?.bids != null ? res : { bids: Array.isArray(res) ? res : [], totalCount: 0, page: 1, limit, totalPages: 0 };
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
