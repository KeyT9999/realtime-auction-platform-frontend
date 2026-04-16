// Mục đích tệp: Chua logic nghiep vu chinh cho phan chatService.
import { apiService } from './api';

export const chatService = {
  getFirebaseToken: async () => apiService.get('/chat/firebase-token'),
};
