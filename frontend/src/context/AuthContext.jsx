import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (username, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { username, password });
      const { access_token, user: userData } = res.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { username, email, password });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, isAdmin, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
