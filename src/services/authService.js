import { apiService } from './api';
import { tokenService } from './tokenService';

class AuthService {
  async login(email, password) {
    const response = await apiService.post('/auth/login', { email, password });
    this.setAuthData(response);
    return response;
  }

  async register(fullName, email, password, verificationMethod = 'link') {
    // Convert string to enum: 'link' -> 0, 'otp' -> 1
    const verificationMethodEnum = verificationMethod === 'otp' ? 1 : 0;
    const response = await apiService.post('/auth/register', {
      fullName,
      email,
      password,
      verificationMethod: verificationMethodEnum,
    });
    // Chỉ set auth data nếu có tokens (tức là đã verify email)
    // Nếu chưa verify thì response sẽ không có tokens
    if (response.accessToken && response.refreshToken) {
      this.setAuthData(response);
    }
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

  async verifyOtp(email, otpCode) {
    return await apiService.post('/auth/verify-otp', { email, otpCode });
  }

  async resendVerification(email, verificationMethod = null) {
    const body = { email };
    if (verificationMethod) {
      // Convert string to enum: 'link' -> 0, 'otp' -> 1
      body.verificationMethod = verificationMethod === 'otp' ? 1 : 0;
    }
    return await apiService.post('/auth/resend-verification', body);
  }

  async changePassword(oldPassword, newPassword) {
    return await apiService.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  }

  async refreshToken() {
    const response = await apiService.post('/auth/refresh-token', {});
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
    // Gọi backend để xóa cookie refresh token
    apiService.post('/auth/logout', {}).catch(() => {});
    tokenService.clearAll();
  }

  setAuthData(response) {
    if (response.accessToken) {
      tokenService.setAccessToken(response.accessToken);
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
