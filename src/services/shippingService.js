import { apiService } from './api';

class ShippingService {
  async createShippingInfo(data) {
    return await apiService.post('/shipping', data);
  }

  async getShippingInfoByAuction(auctionId) {
    return await apiService.get(`/shipping/auction/${auctionId}`);
  }

  async updateShippingInfo(id, data) {
    return await apiService.put(`/shipping/${id}`, data);
  }
}

export const shippingService = new ShippingService();
