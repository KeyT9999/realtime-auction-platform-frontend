import { createContext, useContext, useState, useEffect } from 'react';
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
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (tokenService.isAuthenticated()) {
          const currentUser = tokenService.getUser();
          if (currentUser) {
            // Verify token is still valid by fetching profile
            try {
              const profile = await authService.getProfile();
              setUser(profile);
              setIsAuthenticated(true);
            } catch (error) {
              // Token invalid, clear storage
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
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

  const register = async (fullName, email, password) => {
    try {
      const response = await authService.register(fullName, email, password);
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

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
