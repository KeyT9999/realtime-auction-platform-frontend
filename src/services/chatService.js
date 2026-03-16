import { apiService } from './api';

export const chatService = {
  getFirebaseToken: async () => apiService.get('/chat/firebase-token'),
};
