import { apiService } from './api';

class WatchlistService {
  async getMyWatchlist() {
    return await apiService.get('/watchlist/my-watchlist');
  }

  async addToWatchlist(auctionId) {
    return await apiService.post('/watchlist', { auctionId });
  }

  async removeFromWatchlist(id) {
    return await apiService.delete(`/watchlist/${id}`);
  }

  async getWatchlistStats() {
    return await apiService.get('/watchlist/stats');
  }
}

export const watchlistService = new WatchlistService();
