import { apiService } from './api';

class AdminService {
  async getUsers(page = 1, pageSize = 10, search = null, role = null, isLocked = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (isLocked !== null) params.append('isLocked', isLocked.toString());

    return await apiService.get(`/admin/users?${params.toString()}`);
  }

  async getUserById(id) {
    return await apiService.get(`/admin/users/${id}`);
  }

  async createUser(userData) {
    return await apiService.post('/admin/users', userData);
  }

  async updateUser(id, userData) {
    return await apiService.put(`/admin/users/${id}`, userData);
  }

  async deleteUser(id) {
    return await apiService.delete(`/admin/users/${id}`);
  }

  async lockUser(id, reason = null) {
    return await apiService.post(`/admin/users/${id}/lock`, { reason });
  }

  async unlockUser(id) {
    return await apiService.post(`/admin/users/${id}/unlock`, {});
  }

  async changeUserRole(id, role) {
    return await apiService.put(`/admin/users/${id}/role`, { role });
  }

  async getUserStats() {
    return await apiService.get('/admin/stats');
  }

  async getDashboardStats() {
    return await apiService.get('/admin/dashboard/stats');
  }

  async getDashboardCharts() {
    return await apiService.get('/admin/dashboard/charts');
  }

  async getDashboardActivities() {
    return await apiService.get('/admin/dashboard/activities');
  }

  async getDashboardAlerts() {
    return await apiService.get('/admin/dashboard/alerts');
  }

  // Bulk actions
  async bulkLockUsers(userIds, reason = null) {
    return await apiService.post('/admin/users/bulk-lock', { userIds, reason });
  }

  async bulkUnlockUsers(userIds) {
    return await apiService.post('/admin/users/bulk-unlock', { userIds });
  }

  async bulkDeleteUsers(userIds) {
    return await apiService.post('/admin/users/bulk-delete', { userIds });
  }

  async bulkChangeRole(userIds, role) {
    return await apiService.post('/admin/users/bulk-role', { userIds, role });
  }

  // User detail methods
  async getUserAuctions(userId) {
    return await apiService.get(`/admin/users/${userId}/auctions`);
  }

  async getUserBids(userId) {
    return await apiService.get(`/admin/users/${userId}/bids`);
  }

  async getUserTransactions(userId) {
    return await apiService.get(`/admin/users/${userId}/transactions`);
  }

  // Balance management
  async addBalance(userId, data) {
    return await apiService.post(`/admin/users/${userId}/balance/add`, data);
  }

  async subtractBalance(userId, data) {
    return await apiService.post(`/admin/users/${userId}/balance/subtract`, data);
  }

  // Withdrawal management
  async getWithdrawals(status = null) {
    const params = status !== null ? `?status=${status}` : '';
    return await apiService.get(`/admin/withdrawals${params}`);
  }

  async getWithdrawalDetail(id) {
    return await apiService.get(`/admin/withdrawals/${id}`);
  }

  async approveWithdrawal(id) {
    return await apiService.post(`/admin/withdrawals/${id}/approve`);
  }

  async rejectWithdrawal(id, reason) {
    return await apiService.post(`/admin/withdrawals/${id}/reject`, { reason });
  }

  async completeWithdrawal(id, transactionCode, transactionProof = null, actualAmount = null) {
    return await apiService.post(`/admin/withdrawals/${id}/complete`, {
      transactionCode,
      transactionProof,
      actualAmount
    });
  }

  async revertWithdrawal(id) {
    return await apiService.post(`/admin/withdrawals/${id}/revert`);
  }
}

export const adminService = new AdminService();
