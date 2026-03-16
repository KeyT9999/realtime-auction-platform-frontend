import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { AUTH_CLEARED_EVENT, tokenService } from '../services/tokenService';

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
    const handleAuthCleared = () => {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    return () => window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (tokenService.isAuthenticated()) {
          try {
            const profile = await authService.getProfile();
            setUser(profile);
            setIsAuthenticated(true);
            return;
          } catch {
            // Try cookie-based refresh next.
          }
        }

        try {
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            const profile = await authService.getProfile();
            setUser(profile);
            setIsAuthenticated(true);
            return;
          }
        } catch {
          // Refresh failed. Treat as signed out.
        }

        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, captchaToken = null) => {
    const response = await authService.login(email, password, captchaToken);
    setUser({
      id: response.id,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
    });
    setIsAuthenticated(true);
    return response;
  };

  const register = async (fullName, email, password, verificationMethod = 'link', captchaToken = null) => {
    const response = await authService.register(fullName, email, password, verificationMethod, captchaToken);
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
  };

  const googleLogin = async (idToken) => {
    const response = await authService.googleLogin(idToken);
    setUser({
      id: response.id,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
    });
    setIsAuthenticated(true);
    return response;
  };

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);

    try {
      await authService.logout();
    } catch {
      tokenService.clearAll();
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await authService.getProfile();
    setUser(profile);
    setIsAuthenticated(true);
    return profile;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    refreshUser,
  }), [user, loading, isAuthenticated, login, register, googleLogin, logout, updateUser, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
