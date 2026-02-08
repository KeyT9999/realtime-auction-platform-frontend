import { apiService } from './api';

export const orderService = {
    // Get buyer's orders (won auctions)
    getMyOrders: () => {
        return apiService.get('/orders/my-orders');
    },

    // Get seller's sales
    getMySales: () => {
        return apiService.get('/orders/my-sales');
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
