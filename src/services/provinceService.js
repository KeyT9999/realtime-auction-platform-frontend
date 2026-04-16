// Mục đích tệp: Chua logic nghiep vu chinh cho phan provinceService.
import { apiService } from './api';

class ProvinceService {
  async getProvinces() {
    return await apiService.get('/provinces');
  }
}

export const provinceService = new ProvinceService();
