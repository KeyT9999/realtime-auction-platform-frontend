// Mục đích tệp: Chua logic nghiep vu chinh cho phan orderService.
import { apiService } from './api';

export const orderService = {
    // Get buyer's orders (won auctions). filters: { status, fromDate, toDate, search }
    getMyOrders: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status != null && filters.status !== '') params.set('status', filters.status);
        if (filters.fromDate) params.set('fromDate', filters.fromDate);
        if (filters.toDate) params.set('toDate', filters.toDate);
        if (filters.search) params.set('search', filters.search);
        const q = params.toString();
        return apiService.get(q ? `/orders/my-orders?${q}` : '/orders/my-orders');
    },

    // Get seller's sales. filters: { status, fromDate, toDate, search }
    getMySales: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status != null && filters.status !== '') params.set('status', filters.status);
        if (filters.fromDate) params.set('fromDate', filters.fromDate);
        if (filters.toDate) params.set('toDate', filters.toDate);
        if (filters.search) params.set('search', filters.search);
        const q = params.toString();
        return apiService.get(q ? `/orders/my-sales?${q}` : '/orders/my-sales');
    },

    // Get single order by ID
    getOrder: (orderId) => {
        return apiService.get(`/orders/${orderId}`);
    },

    // Seller marks order as shipped
    shipOrder: (orderId, data) => {
        return apiService.post(`/orders/${orderId}/ship`, data);
    },

    // Buyer confirms receipt
    confirmOrder: (orderId) => {
        return apiService.post(`/orders/${orderId}/confirm`, {});
    },

    // Cancel order
    cancelOrder: (orderId, reason = null) => {
        return apiService.post(`/orders/${orderId}/cancel`, { reason });
    },
};
