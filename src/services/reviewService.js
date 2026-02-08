import { apiService } from './api';

export const reviewService = {
    // Create a review for an order
    createReview: (orderId, rating, comment) => {
        return apiService.post(`/review/${orderId}`, { rating, comment });
    },

    // Get user reviews and rating stats
    getUserReviews: (userId) => {
        return apiService.get(`/review/user/${userId}`);
    },

    // Get user rating only (avg + count)
    getUserRating: (userId) => {
        return apiService.get(`/review/rating/${userId}`);
    },

    // Get reviews for an order
    getOrderReviews: (orderId) => {
        return apiService.get(`/review/order/${orderId}`);
    },
};
