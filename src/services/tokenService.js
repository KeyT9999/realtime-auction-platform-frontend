const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

class TokenService {
  // Access Token
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
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
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch (error) {
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
