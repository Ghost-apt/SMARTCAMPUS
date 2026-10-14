import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartcampus_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check and revalidate user session on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('smartcampus_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          setToken(storedToken);
        } else {
          // Invalidate
          localStorage.removeItem('smartcampus_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Session verification note:', err.userMessage || err.message);
        localStorage.removeItem('smartcampus_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        localStorage.setItem('smartcampus_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, role: receivedUser.role };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      const msg = err.userMessage || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        localStorage.setItem('smartcampus_token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, role: receivedUser.role };
      }
      return { success: false, message: 'Registration failed.' };
    } catch (err) {
      const msg = err.userMessage || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network error on logout
    } finally {
      localStorage.removeItem('smartcampus_token');
      setUser(null);
      setToken(null);
    }
  };

  // Update profile in state
  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
