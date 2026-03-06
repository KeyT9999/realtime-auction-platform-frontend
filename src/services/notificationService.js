import { apiService } from './api';

export const notificationService = {
    getNotifications: async (page = 1, limit = 20) => {
        return await apiService.get(`/notifications?page=${page}&limit=${limit}`);
    },
    markAsRead: async (id) => {
        return await apiService.patch(`/notifications/${id}/read`);
    },
    markAllAsRead: async () => {
        return await apiService.patch('/notifications/read-all');
    },
};
