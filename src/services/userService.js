import { apiService } from './api';

class UserService {
  async getProfile() {
    return await apiService.get('/users/profile');
  }

  async updateProfile(data) {
    return await apiService.put('/users/profile', data);
  }

  async getSellerStats(userId) {
    return await apiService.get(`/users/${userId}/stats`);
  }
}

export const userService = new UserService();
