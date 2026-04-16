// Mục đích tệp: Chua logic nghiep vu chinh cho phan tokenService.
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
export const AUTH_CLEARED_EVENT = 'auth:cleared';

class TokenService {
  emitAuthCleared() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_CLEARED_EVENT));
    }
  }

  // Access Token — use sessionStorage instead of localStorage for better XSS protection
  // sessionStorage is tab-scoped and not accessible by scripts in other tabs
  getAccessToken() {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  removeAccessToken() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  // User Info
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  removeUser() {
    localStorage.removeItem(USER_KEY);
  }

  // Clear all
  clearAll() {
    this.removeAccessToken();
    this.removeUser();
    this.emitAuthCleared();
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    return token && !this.isTokenExpired(token);
  }
}

export const tokenService = new TokenService();
