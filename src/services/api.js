// Backend API URL - có thể override bằng environment variable
// Dùng HTTP cho development để tránh SSL certificate issues
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5145/api';

import { tokenService } from './tokenService';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const accessToken = tokenService.getAccessToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include', // gửi cookie cho mọi request
    };

    try {
      console.log(`[API] Requesting: ${url}`);
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token
      if (
        response.status === 401 &&
        !endpoint.includes('/auth/refresh-token') &&
        !endpoint.includes('/auth/login')
      ) {
        try {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            const newToken = tokenService.getAccessToken();
            if (newToken) {
              config.headers['Authorization'] = `Bearer ${newToken}`;
            } else {
              delete config.headers['Authorization'];
            }
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              throw await this.handleErrorResponse(retryResponse);
            }
            const data = await retryResponse.json();
            return data;
          }
        } catch (refreshError) {
          tokenService.clearAll();
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = await response.json();
      console.log('[API] Success:', data);
      return data;
    } catch (error) {
      console.error('[API] Request failed:', {
        url,
        error: error.message,
        type: error.name,
      });

      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Make sure backend is running.`);
      }

      throw error;
    }
  }

  async handleErrorResponse(response) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    return error;
  }

  async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}), // refresh token nằm trong cookie
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      tokenService.setAccessToken(data.accessToken);
      if (data.id) {
        tokenService.setUser({
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        });
      }
      return true;
    } catch (error) {
      console.error('[API] Refresh token failed:', error);
      return false;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiService = new ApiService();
