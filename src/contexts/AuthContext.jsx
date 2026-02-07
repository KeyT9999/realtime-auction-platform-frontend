import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { tokenService } from '../services/tokenService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập và cố gắng refresh từ cookie nếu cần
    const checkAuth = async () => {
      try {
        const hasAccessToken = tokenService.isAuthenticated();
        const storedUser = tokenService.getUser();

        if (hasAccessToken) {
          try {
            const profile = await authService.getProfile();
            setUser(profile);
            setIsAuthenticated(true);
            return;
          } catch {
            // Access token có thể hết hạn, thử refresh
          }
        }

        // Nếu không có access token hợp lệ, thử refresh bằng cookie
        try {
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            const profile = await authService.getProfile();
            setUser(profile);
            setIsAuthenticated(true);
            return;
          }
        } catch {
          // Refresh thất bại => coi như chưa đăng nhập
        }

        // Nếu không refresh được, xóa dữ liệu cũ
        authService.logout();
        setUser(storedUser || null);
        setIsAuthenticated(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser({
        id: response.id,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      });
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (fullName, email, password, verificationMethod = 'link') => {
    try {
      const response = await authService.register(fullName, email, password, verificationMethod);
      // Chỉ set authenticated nếu có tokens (tức là đã verify email)
      // Nếu chưa verify thì response sẽ không có tokens và user chưa được authenticate
      if (response.accessToken && response.refreshToken) {
        setUser({
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          role: response.role,
        });
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await authService.googleLogin(idToken);
      setUser({
        id: response.id,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      });
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
