// Mục đích tệp: Chua logic nghiep vu chinh cho phan searchService.
import { apiService as api } from './api';

/**
 * Search Service - API gọi đến backend Search Controller
 */
export const searchService = {
  /**
   * Tìm kiếm bài viết với bộ lọc động
   * @param {Object} searchRequest - Request parameters
   * @returns {Promise<{posts: Array, totalCount: number, facets: Object, currentPage: number, totalPages: number}>}
   */
  async search(searchRequest) {
    return await api.post('/search', searchRequest);
  },

  /**
   * Tìm kiếm với GET (query string)
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async searchGet(params) {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/search?${queryString}`);
  },

  /**
   * Lấy cấu hình filter theo category
   * @returns {Promise<{categories: Array, allCategories: Array}>}
   */
  async getFilterConfig() {
    return await api.get('/search/filter-config');
  },

  /**
   * Lấy gợi ý từ khóa (autocomplete)
   * @param {string} keyword - Từ khóa đang gõ
   * @param {string} category - Category (optional)
   * @returns {Promise<string[]>}
   */
  async getSuggestions(keyword, category = null) {
    const params = new URLSearchParams({ keyword });
    if (category) {
      params.append('category', category);
    }
    return await api.get(`/search/suggestions?${params}`);
  },

  /**
   * Lấy từ khóa phổ biến
   * @param {string} category - Category (optional)
   * @returns {Promise<string[]>}
   */
  async getPopularKeywords(category = null) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return await api.get(`/search/popular-keywords${params}`);
  },
};
