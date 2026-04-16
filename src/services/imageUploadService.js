// Mục đích tệp: Chua logic nghiep vu chinh cho phan imageUploadService.
import { apiService } from './api';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

class ImageUploadService {
  async uploadImage(file) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File không được vượt quá ${MAX_FILE_SIZE_MB}MB.`);
    }
    const formData = new FormData();
    formData.append('file', file);
    return await apiService.post('/products/upload-image', formData);
  }

  async uploadImages(files) {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File "${file.name}" vượt quá ${MAX_FILE_SIZE_MB}MB.`);
      }
    }
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return await apiService.post('/products/upload-images', formData);
  }
}

export const imageUploadService = new ImageUploadService();
