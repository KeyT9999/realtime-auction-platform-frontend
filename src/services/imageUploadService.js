import { apiService } from './api';

class ImageUploadService {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    // Không set Content-Type header - browser sẽ tự động thêm với boundary
    return await apiService.post('/products/upload-image', formData);
  }

  async uploadImages(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Không set Content-Type header - browser sẽ tự động thêm với boundary
    return await apiService.post('/products/upload-images', formData);
  }
}

export const imageUploadService = new ImageUploadService();
