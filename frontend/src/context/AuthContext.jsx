import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const stored = authService.getStoredSession();
      if (stored.token) {
        setToken(stored.token);
        setUser(stored.user);

        // Verify with server in background
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch {
          // Token expired or invalid
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    setToken(result.token);
    return result;
  }, []);

  const register = useCallback(async (data) => {
    const result = await authService.register(data);
    setUser(result.user);
    setToken(result.token);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
