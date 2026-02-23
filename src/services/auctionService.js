import { apiService } from './api';

// Service thống nhất cho Auction, dùng route REST mới `/auctions`
export const auctionService = {
  getAuctions: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Search & filters
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.status !== undefined && filters.status !== '') params.append('status', filters.status);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.sellerId) params.append('sellerId', filters.sellerId);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.timeFilter) params.append('timeFilter', filters.timeFilter);
    
    // Sorting
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    // Pagination
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);

    const queryString = params.toString();
    const endpoint = queryString ? `/auctions?${queryString}` : '/auctions';
    return await apiService.get(endpoint);
  },

  getAuctionById: async (id) => {
    return await apiService.get(`/auctions/${id}`);
  },

  createAuction: async (data) => {
    return await apiService.post('/auctions', data);
  },

  updateAuction: async (id, data) => {
    return await apiService.put(`/auctions/${id}`, data);
  },

  deleteAuction: async (id) => {
    return await apiService.delete(`/auctions/${id}`);
  },

  updateAuctionStatus: async (id, status) => {
    return await apiService.put(`/auctions/${id}/status`, { status });
  },

  getAuctionStats: async () => {
    return await apiService.get('/auctions/stats');
  },

  acceptBid: async (auctionId, message = null) => {
    return await apiService.post(`/auctions/${auctionId}/accept-bid`, { message });
  },

  buyout: async (auctionId) => {
    return await apiService.post(`/auctions/${auctionId}/buyout`);
  },

  cancelAuction: async (auctionId) => {
    return await apiService.post(`/auctions/${auctionId}/cancel`);
  },

  /**
   * Duplicate an auction (clone): creates new product and new draft auction with same data.
   * Returns the new auction. Pass productService to avoid circular dependency.
   */
  duplicateAuction: async (auctionId, productService) => {
    const auction = await apiService.get(`/auctions/${auctionId}`);
    if (!auction || !auction.productId) {
      throw new Error('Đấu giá hoặc sản phẩm không tồn tại');
    }
    const product = auction.product;
    if (!product) {
      throw new Error('Thông tin sản phẩm không có');
    }
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 120 * 60 * 1000);
    const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

    const productPayload = {
      name: product.name || auction.title,
      description: product.description || '',
      condition: product.condition ?? 0,
      category: auction.categoryId || product.category || '',
      brand: product.brand,
      model: product.model,
      year: product.year,
      images: product.images && product.images.length ? product.images : (auction.images && auction.images.length ? auction.images : []),
      specifications: product.specifications,
      isOriginalOwner: product.isOriginalOwner ?? false,
      allowReturn: product.allowReturn ?? false,
      additionalNotes: product.additionalNotes,
    };
    const newProduct = await productService.create(productPayload);

    const auctionPayload = {
      title: (auction.title || '') + ' (Bản sao)',
      description: auction.description || undefined,
      startingPrice: auction.startingPrice ?? auction.currentPrice,
      reservePrice: auction.reservePrice,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationMinutes,
      categoryId: auction.categoryId,
      productId: newProduct.id,
      bidIncrement: auction.bidIncrement ?? 1000,
      images: auction.images && auction.images.length ? auction.images : [],
    };
    if (auction.buyoutPrice) {
      auctionPayload.buyoutPrice = auction.buyoutPrice;
    }
    return await apiService.post('/auctions', auctionPayload);
  },
};
