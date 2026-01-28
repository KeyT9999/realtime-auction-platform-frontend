import { apiService } from './api';

export const auctionService = {
    getActiveAuctions: async () => {
        return await apiService.get('/Auction'); // Maps to GetActiveAuctions
    },

    getAuctionById: async (id) => {
        return await apiService.get(`/Auction/${id}`);
    },

    createAuction: async (auctionData) => {
        return await apiService.post('/Auction/create', auctionData);
    },

    placeBid: async (auctionId, amount) => {
        return await apiService.post('/Auction/bid', { auctionId, amount });
    }
};
