import { apiService } from './api';
import { tokenService } from './tokenService';

class AuthService {
  async login(email, password) {
    const response = await apiService.post('/auth/login', { email, password });
    this.setAuthData(response);
    return response;
  }

  async register(fullName, email, password) {
    const response = await apiService.post('/auth/register', {
      fullName,
      email,
      password,
    });
    this.setAuthData(response);
    return response;
  }

  async googleLogin(idToken) {
    const response = await apiService.post('/auth/google-login', { idToken });
    this.setAuthData(response);
    return response;
  }

  async forgotPassword(email) {
    return await apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, newPassword) {
    return await apiService.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  async verifyEmail(token) {
    return await apiService.post('/auth/verify-email', { token });
  }

  async resendVerification(email) {
    return await apiService.post('/auth/resend-verification', { email });
  }

  async changePassword(oldPassword, newPassword) {
    return await apiService.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  }

  async refreshToken() {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await apiService.post('/auth/refresh-token', {
      refreshToken,
    });
    this.setAuthData(response);
    return response;
  }

  async getProfile() {
    return await apiService.get('/users/profile');
  }

  async updateProfile(fullName, phone, address) {
    return await apiService.put('/users/profile', {
      fullName,
      phone,
      address,
    });
  }

  logout() {
    tokenService.clearAll();
  }

  setAuthData(response) {
    if (response.accessToken) {
      tokenService.setAccessToken(response.accessToken);
    }
    if (response.refreshToken) {
      tokenService.setRefreshToken(response.refreshToken);
    }
    if (response.id) {
      tokenService.setUser({
        id: response.id,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      });
    }
  }

  isAuthenticated() {
    return tokenService.isAuthenticated();
  }

  getCurrentUser() {
    return tokenService.getUser();
  }
}

export const authService = new AuthService();
