import { apiService } from './api';

const toUploadFile = async (image, index) => {
  if (image instanceof File) {
    return image;
  }

  if (image instanceof Blob) {
    return new File([image], `image-${index}.jpg`, { type: image.type || 'image/jpeg' });
  }

  if (typeof image === 'string') {
    const response = await fetch(image);
    if (!response.ok) {
      throw new Error(`Khong the tai anh de phan tich (HTTP ${response.status})`);
    }

    const blob = await response.blob();
    return new File([blob], `image-${index}.jpg`, { type: blob.type || 'image/jpeg' });
  }

  throw new Error('Dinh dang anh khong ho tro');
};

export const analyzeProductImage = async (images) => {
  if (!images || images.length === 0) return null;

  const formData = new FormData();
  const uploadFiles = await Promise.all(images.map((image, index) => toUploadFile(image, index)));
  uploadFiles.forEach((file) => formData.append('images', file));

  return apiService.post('/ai/analyze-product-images', formData);
};
