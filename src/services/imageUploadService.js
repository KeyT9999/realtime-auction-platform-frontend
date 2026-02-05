import { apiService } from './api';

class ImageUploadService {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async uploadImages(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return await apiService.post('/products/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const imageUploadService = new ImageUploadService();
